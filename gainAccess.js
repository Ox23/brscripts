/** @param {NS} ns **/
export async function main(ns) {
    ns.disableLog("ALL");

    // Check if an argument (server name) was provided.
    let targetArg = ns.args[0];
    let servers = [];
    
    if (targetArg) {
        servers = [targetArg];
        ns.tprint(`Processing single server provided as argument: ${targetArg}`);
    } else {
        // Load the array from servers.txt on home.
        if (!ns.fileExists("servers.txt", "home")) {
            ns.tprint("ERROR: servers.txt not found on home.");
            return;
        }
        let fileContent = ns.read("servers.txt");
        try {
            servers = JSON.parse(fileContent);
            ns.tprint(`Loaded ${servers.length} servers from servers.txt.`);
        } catch (e) {
            ns.tprint("ERROR: Failed to parse servers.txt.");
            return;
        }
    }
    
    // Process each server in the array
    for (const server of servers) {
        ns.tprint(`Checking server: ${server}`);
        
        // If already have root, skip this server.
        if (ns.hasRootAccess(server)) {
            ns.tprint(`Already have root on ${server}. Skipping.`);
            continue;
        }
        
        // Attempt to open available ports.
        // For each available port-opening tool, output a success message after executing.
        if (ns.fileExists("BruteSSH.exe", "home")) {
            ns.brutessh(server);
            ns.tprint(`${server}: Successfully opened SSH using BruteSSH.exe.`);
        }
        if (ns.fileExists("FTPCrack.exe", "home")) {
            ns.ftpcrack(server);
            ns.tprint(`${server}: Successfully opened FTP using FTPCrack.exe.`);
        }
        /*
        if (ns.fileExists("relaySMTP.exe", "home")) {
            ns.relaysmtp(server);
            ns.tprint(`${server}: Successfully opened SMTP using relaySMTP.exe.`);
        }
        if (ns.fileExists("HTTPWorm.exe", "home")) {
            ns.httpworm(server);
            ns.tprint(`${server}: Successfully opened HTTP using HTTPWorm.exe.`);
        }
        if (ns.fileExists("SQLInject.exe", "home")) {
            ns.sqlinject(server);
            ns.tprint(`${server}: Successfully opened SQL using SQLInject.exe.`);
        }
        */
        // Attempt to nuke the server.
        ns.nuke(server);
        if (ns.hasRootAccess(server)) {
            ns.tprint(`SUCCESS: Gained root on ${server} after nuking.`);
        } else {
            ns.tprint(`ERROR: Failed to gain root on ${server} after nuking.`);
        }
    }
}
