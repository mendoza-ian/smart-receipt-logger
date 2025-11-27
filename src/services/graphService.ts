// src/services/graphService.ts
/**
 * Graph service utilities for:
 * - acquiring tokens (msal)
 * - finding the shared Lyka / Allowance Receipt / {Employee} folder
 * - creating month folders
 * - checking if a file exists in the month folder
 * - uploading files with overwrite confirmation
 *
 * Note: This file uses browser confirm() for the overwrite prompt.
 */

import { msalInstance } from "../utils/msalInstance";
import { loginRequest } from "../authConfig";

const GRAPH_BASE = "https://graph.microsoft.com/v1.0";

// Acquire token (silent first, redirect fallback)
async function getToken(): Promise<string> {
  const accounts = msalInstance.getAllAccounts();
  if (!accounts || accounts.length === 0) {
    throw new Error("No MSAL account found. Please sign in.");
  }

  try {
    const response = await msalInstance.acquireTokenSilent({
      ...loginRequest,
      account: accounts[0],
    });
    return response.accessToken;
  } catch (err) {
    // interactive fallback - this will redirect the user
    await msalInstance.acquireTokenRedirect(loginRequest);
    throw new Error("Redirecting for token acquisition...");
  }
}

/**
 * List drives available to the signed-in user (personal + shared drives)
 */
export async function listDrives() {
  const token = await getToken();
  const res = await fetch(`${GRAPH_BASE}/me/drives`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Failed to list drives: ${res.status} ${txt}`);
  }
  const data = await res.json();
  return data.value || [];
}

/**
 * Find the shared drive and the employee folder:
 * - locate drive that contains "Allowance Receipt"
 * - find "Allowance Receipt" inside that drive
 * - find or create a folder for the signed-in employee (employee name)
 *
 * Returns: { drive, employeeFolder }
 */
export async function findEmployeeFolder() {
  const token = await getToken();
  const accounts = msalInstance.getAllAccounts();
  const account = accounts[0];
  const employeeName = (account.name || account.username || "Unknown").trim();

  // Step 1: list drives
  const drives = await listDrives();

  let targetDrive: any = null;

  // Search each drive root children to find "Allowance Receipt"
  for (const d of drives) {
    const r = await fetch(`${GRAPH_BASE}/drives/${d.id}/root/children`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!r.ok) continue;
    const js = await r.json();
    const items = js.value || [];
    const found = items.find(
      (it: any) =>
        it.name && it.name.toString().toLowerCase().includes("allowance receipt")
    );
    if (found) {
      targetDrive = d;
      break;
    }
  }

  if (!targetDrive) {
    throw new Error("Could not find a drive containing 'Allowance Receipt'.");
  }

  // Step 2: get the Allowance Receipt folder item
  const rootRes = await fetch(`${GRAPH_BASE}/drives/${targetDrive.id}/root/children`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!rootRes.ok) throw new Error("Failed to read drive root children.");
  const rootJson = await rootRes.json();
  const allowanceFolder = rootJson.value.find(
    (i: any) => i.name && i.name.toString().toLowerCase().includes("allowance receipt")
  );

  if (!allowanceFolder) {
    throw new Error("Allowance Receipt folder not found in target drive.");
  }

  // Step 3: look for employee folder under Allowance Receipt
  const empRes = await fetch(
    `${GRAPH_BASE}/drives/${targetDrive.id}/items/${allowanceFolder.id}/children`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!empRes.ok) throw new Error("Failed to list employee folder children.");
  const empJson = await empRes.json();
  let employeeFolder = empJson.value.find(
    (i: any) => i.name && i.name.toString().toLowerCase() === employeeName.toLowerCase()
  );

  // Create employee folder if missing
  if (!employeeFolder) {
    const createRes = await fetch(
      `${GRAPH_BASE}/drives/${targetDrive.id}/items/${allowanceFolder.id}/children`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: employeeName,
          folder: {},
          "@microsoft.graph.conflictBehavior": "rename",
        }),
      }
    );
    if (!createRes.ok) {
      const txt = await createRes.text();
      throw new Error(`Failed to create employee folder: ${createRes.status} ${txt}`);
    }
    employeeFolder = await createRes.json();
  }

  return { drive: targetDrive, employeeFolder };
}

/**
 * Create or get month folder inside the employee folder.
 * Example folder name: "November 2025"
 */
export async function getMonthFolder() {
  const token = await getToken();
  const { drive, employeeFolder } = await findEmployeeFolder();

  const now = new Date();
  const monthName = now.toLocaleString("default", { month: "long" });
  const folderName = `${monthName} ${now.getFullYear()}`;

  const listRes = await fetch(
    `${GRAPH_BASE}/drives/${drive.id}/items/${employeeFolder.id}/children`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!listRes.ok) {
    throw new Error("Failed to list employee folder children.");
  }
  const listJson = await listRes.json();
  let monthFolder = listJson.value.find((i: any) => i.name === folderName);

  if (!monthFolder) {
    const createRes = await fetch(
      `${GRAPH_BASE}/drives/${drive.id}/items/${employeeFolder.id}/children`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: folderName,
          folder: {},
          "@microsoft.graph.conflictBehavior": "rename",
        }),
      }
    );
    if (!createRes.ok) {
      const txt = await createRes.text();
      throw new Error(`Failed to create month folder: ${createRes.status} ${txt}`);
    }
    monthFolder = await createRes.json();
  }

  return { drive, monthFolder };
}

/**
 * Check if a file with `fileName` exists inside the current month folder.
 * Returns true/false.
 */
export async function fileExistsInMonthFolder(fileName: string): Promise<boolean> {
  const token = await getToken();
  const { drive, monthFolder } = await getMonthFolder();

  const listRes = await fetch(
    `${GRAPH_BASE}/drives/${drive.id}/items/${monthFolder.id}/children`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!listRes.ok) {
    const txt = await listRes.text();
    throw new Error(`Failed to list month folder children: ${listRes.status} ${txt}`);
  }

  const listJson = await listRes.json();
  return (listJson.value || []).some((item: any) => item.name === fileName);
}

/**
 * Uploads a file (PUT) to the month folder.
 * If the file exists, prompt the user for overwrite confirmation.
 *
 * Returns the uploaded item JSON from Graph.
 */
export async function uploadToOneDrive(fileName: string, fileBlob: Blob) {
  const token = await getToken();
  const { drive, monthFolder } = await getMonthFolder();

  // Check exist
  const exists = await fileExistsInMonthFolder(fileName);

  if (exists) {
    // Browser confirm popup
    const ok = confirm(`${fileName} already exists in the folder.\nDo you want to overwrite it?`);
    if (!ok) {
      // Caller should handle the thrown error to show user-friendly message
      throw new Error("User cancelled overwrite.");
    }
  }

  // Upload (PUT will overwrite)
  const uploadUrl = `${GRAPH_BASE}/drives/${drive.id}/items/${monthFolder.id}:/${fileName}:/content`;
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      // content-type should not be set for binary; fetch will set it automatically
    },
    body: fileBlob,
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`OneDrive upload failed: ${res.status} ${txt}`);
  }

  return await res.json();
}
