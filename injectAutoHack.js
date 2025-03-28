/** @param {NS} ns **/
export async function main(ns) {
    ns.disableLog("ALL");

    // Check if servers.txt exists
    if (!ns.fileExists("servers.txt", "home")) {
        ns.tprint("ERROR: servers.txt not found on home.");
        return;
    }

    // Read and parse the JSON array from servers.txt
    let fileContent = ns.read("servers.txt");
    let servers;
    try {
        servers = JSON.parse(fileContent);
    } catch (e) {
        ns.tprint("ERROR: Failed to parse servers.txt.");
        return;
    }
    
    // Get the RAM required by autoHack.js from home (assuming it's the same everywhere)
    const scriptName = "autoHack.js";
    const scriptRam = ns.getScriptRam(scriptName, "home");
    
    ns.tprint(`INFO: Attempting to deploy ${scriptName} on ${servers.length} servers.`);
    
    // Process each server in the array sequentially
    for (const server of servers) {
        // Optionally skip home if you don't want to run autoHack on home
        if (server === "home") {
            ns.tprint(`Skipping home.`);
            continue;
        }
        
        ns.tprint(`\nChecking server: ${server}`);
        
        // Check if we have root access
        if (!ns.hasRootAccess(server)) {
            ns.tprint(`ERROR: No root access on ${server}. Skipping.`);
            continue;
        }
        
        // Check if autoHack.js is already present on the target server.
        if (ns.fileExists(scriptName, server)) {
            ns.tprint(`${scriptName} already exists on ${server}, skipping copy.`);
        } else {
            const copySuccess = ns.scp(scriptName, server, "home");
            if (!copySuccess) {
                ns.tprint(`ERROR: Failed to copy ${scriptName} to ${server}. Skipping.`);
                continue;
            }
            ns.tprint(`SUCCESS: Copied ${scriptName} to ${server}.`);

            // Execute autoHack.js on the target server, passing the server name as an argument
            const pid = ns.exec(scriptName, server, 1, server);
            if (pid === 0) {
                ns.tprint(`ERROR: Failed to execute ${scriptName} on ${server}.`);
            } else {
                ns.tprint(`SUCCESS: Executed ${scriptName} on ${server} (PID: ${pid}).`);
            }
        }
        await ns.sleep(250);
    }
    
    ns.tprint("\nDONE: Deployment of autoHack.js complete on all servers from servers.txt.");
}
