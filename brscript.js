/** @param {NS} ns **/
export async function main(ns) {
    ns.disableLog("ALL"); // Disable logs for less console spam
    
    const scriptName = "autoHack.js";           // The script we'll deploy
    const scriptRam  = ns.getScriptRam(scriptName, "home");
    const myHackLvl  = ns.getHackingLevel();
    
    // 1) Get a list of *all* servers from "home"
    const allServers = getAllServers(ns);
    
    // 2) Filter to only those you can hack at your current level
    const targetServers = allServers.filter(s => 
        ns.getServerRequiredHackingLevel(s) <= myHackLvl && s !== "home"
    );
    
    ns.tprint(`INFO: Hacking Level = ${myHackLvl}`);
    ns.tprint(`INFO: Found ${allServers.length} total servers.`);
    ns.tprint(`INFO: Targeting ${targetServers.length} servers (below or equal your hack level).`);
    
    // 3) Deploy and run autoHack.js on each target server, one by one
    for (const server of targetServers) {
        // Keep the game responsive by sleeping a bit each iteration
        await ns.sleep(100);
        
        // Attempt root if we don’t have it
        if (!ns.hasRootAccess(server)) {
            tryOpenPorts(ns, server);
            ns.nuke(server);
            // Give the server a moment to “settle” after nuking
            await ns.sleep(1500);
        }
        
        // If we *still* don’t have root, skip
        if (!ns.hasRootAccess(server)) {
            ns.print(`WARN: Could not gain root on ${server}. Skipping...`);
            continue;
        }
        
        // Copy autoHack.js to the server
        const success = await ns.scp(scriptName, "home", server);
        if (!success) {
            ns.print(`ERROR: Failed to copy ${scriptName} to ${server}. Skipping...`);
            continue;
        }
        
        // Check available RAM
        const maxRam = ns.getServerMaxRam(server);
        const usedRam = ns.getServerUsedRam(server);
        const availRam = maxRam - usedRam;
        
        if (availRam < scriptRam) {
            ns.print(`SKIP: ${server} has insufficient RAM. Needs ${scriptRam.toFixed(2)} GB, has ${availRam.toFixed(2)} GB.`);
            continue;
        }
        
        // Execute the script on the target
        const pid = ns.exec(scriptName, server, 1, server);
        if (pid === 0) {
            ns.print(`ERROR: Failed to start ${scriptName} on ${server}.`);
        } else {
            ns.print(`SUCCESS: Started ${scriptName} on ${server} (PID: ${pid}).`);
        }
    }
    
    ns.tprint("DONE: Finished deploying autoHack.js to eligible servers.");
}

/**
 * Returns an array of all servers reachable from "home" via scan(), using a simple DFS or BFS.
 * We do NOT use any awaits here—70 servers is not too big, so this should be quick.
 * @param {NS} ns
 * @returns {string[]}
 */
function getAllServers(ns) {
    const visited = new Set(["home"]);
    const stack = ["home"];
    while (stack.length > 0) {
        const node = stack.pop();
        const neighbors = ns.scan(node);
        for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                stack.push(neighbor);
            }
        }
    }
    return [...visited];
}

/**
 * Attempt to open all possible ports on the target server.
 * @param {NS} ns
 * @param {string} server
 */
function tryOpenPorts(ns, server) {
    if (ns.fileExists("BruteSSH.exe", "home")) {
        ns.brutessh(server);
    }
    if (ns.fileExists("FTPCrack.exe", "home")) {
        ns.ftpcrack(server);
    }
}
