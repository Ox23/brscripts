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
    // Here we define "hackable" as:
    //   - The server is not "home"
    //   - The server has a positive maximum money (i.e., it's a money-making target)
    //   - The required hacking level is <= your current hacking level.
    const myHackLevel = ns.getHackingLevel();
    const hackableServers = [];
    
    for (const server of visited) {
        if (server === "home") continue;
        if (ns.getServerMaxMoney(server) > 0 && ns.getServerRequiredHackingLevel(server) <= myHackLevel) {
            hackableServers.push(server);
        }
    }
    
    // Save the array of hackable servers to "servers.txt" in JSON format.
    const fileContent = JSON.stringify(hackableServers);
    ns.write("servers.txt", fileContent, "w");
    ns.tprint(`Saved hackable servers to servers.txt: ${fileContent}`);
}
