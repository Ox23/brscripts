/** @param {NS} ns **/
export async function main(ns) {
    ns.disableLog("ALL"); // Turn off logging spam for a cleaner console

    const target = ns.args[0];
    if (!target) {
        ns.tprint("Usage: run autoHack.js [target]");
        return;
    }

    while (true) {
        // Tiny sleep to keep the game responsive in rare edge cases
        await ns.sleep(20);

        if (ns.getServerSecurityLevel(target) > ns.getServerMinSecurityLevel(target)) {
            await ns.weaken(target);
        } else if (ns.getServerMoneyAvailable(target) < ns.getServerMaxMoney(target)) {
            await ns.grow(target);
        } else {
            await ns.hack(target);
        }
    }
}
