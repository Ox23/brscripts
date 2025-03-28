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
    
    ns.tprint(`INFO: Attempting to deploy ${scriptName} on ${servers.length} servers.`);
    
    // Process each server in the array sequentially
    for (const server of servers) {
        // Optionally skip home if you don't want to run autoHack on home
        if (server === "home") {
            continue;
        }
                
        // Copy autoHack.js to the target server
        const copySuccess = await ns.scp(scriptName, "home", server);
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
        
        // Sleep briefly before moving on to the next server to allow the game to breathe
        await ns.sleep(250);
    }
    
    ns.tprint("\nDONE: Deployment of autoHack.js complete on all servers from servers.txt.");
}
