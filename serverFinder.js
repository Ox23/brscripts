/** @param {NS} ns **/
export async function main(ns) {
    ns.disableLog("ALL");

    // Gather all servers using a breadth-first search (BFS)
    let visited = new Set();
    let queue = ["home"];
    
    while (queue.length > 0) {
        const server = queue.shift();
        if (!visited.has(server)) {
            visited.add(server);
            const neighbors = ns.scan(server);
            for (const neighbor of neighbors) {
                if (!visited.has(neighbor)) {
                    queue.push(neighbor);
                }
            }
        }
    }
    
    // Determine hackable servers:
    // "Hackable" is defined as:
    //   - The server is not "home"
    //   - The server has a positive maximum money (a money-making target)
    //   - The required hacking level is <= your current hacking level.
    const myHackLevel = ns.getHackingLevel();
    const hackableServers = [];
    
    for (const server of visited) {
        if (server === "home") continue;
        if (ns.getServerMaxMoney(server) > 0 && ns.getServerRequiredHackingLevel(server) <= myHackLevel) {
            hackableServers.push(server);
        }
    }
    
    // Load the existing server list from servers.txt, if it exists.
    let oldServers = [];
    if (ns.fileExists("servers.txt", "home")) {
        let fileContent = ns.read("servers.txt");
        try {
            oldServers = JSON.parse(fileContent);
        } catch (e) {
            ns.tprint("ERROR: Unable to parse servers.txt. Treating as no previous data.");
        }
    }
    
    // Determine which servers are new (present in hackableServers but not in oldServers).
    let newServers = hackableServers.filter(s => !oldServers.includes(s));
    
    // Report new servers and output details about them.
    if (newServers.length > 0) {
        ns.tprint(`New servers found (${newServers.length}):`);
        for (const server of newServers) {
            let reqLevel = ns.getServerRequiredHackingLevel(server);
            let maxMoney = "$" + ns.formatNumber(ns.getServerMaxMoney(server), 2);
            let minSec = ns.getServerMinSecurityLevel(server);
            ns.tprint(`- ${server}: Required Level: ${reqLevel}, Max Money: ${maxMoney}, Min Security: ${minSec}`);
        }
    } else {
        ns.tprint("No new servers found.");
    }
    
    // Save the updated hackable servers array to servers.txt in JSON format.
    let outputContent = JSON.stringify(hackableServers);
    ns.write("servers.txt", outputContent, "w");
    ns.tprint(`Saved hackable servers to servers.txt: ${outputContent}`);
}
