const schedule = require("node-schedule");
const axios = require("axios");
const wait = (t) => new Promise((s) => setTimeout(s, t, t));
const fs = require("node:fs");
const config = require("./config.json");

var s = schedule.scheduleJob("*/10 * * * *", async function () {
    await snapshot();
});

const snapshot = async () => {
    var allHoldings = {};

    var allNFTs = await getAllHolders();

    for (const n of allNFTs) {
        if (config.issuers.includes(n.Owner)) continue;
        if (!allHoldings[n.Owner]) {
            allHoldings[n.Owner] = {
                rank: 0,
                address: n.Owner,
                nfts: 0,
            };
        }
        allHoldings[n.Owner].nfts++;
    }
    let allArray = Object.values(allHoldings);
    allArray.sort((a, b) => b.nfts - a.nfts);
    for (i = 0; i < allArray.length; i++) {
        allArray[i].rank = i + 1;
    }
    fs.writeFile(`./holders.json`, JSON.stringify(allArray, null, 2), finished);
    function finished(err) {
        console.log(`Finished getting holders`);
    }
};

const getAllHolders = async () => {
    var allNFTs = [];
    for (const issuer of config.issuers) {
        var skip = 0;
        var url = `https://api.xrpldata.com/api/v1/xls20-nfts/issuer/${issuer}?limit=1000`;
        while (skip >= 0) {
            var response = await axios.get(url + `&skip=${skip}`);
            if (response.data.data.nfts.length < 1) break;
            for (const n of response.data.data.nfts) {
                allNFTs.push({
                    NFTokenID: n.NFTokenID,
                    Issuer: n.Issuer,
                    Taxon: n.Taxon,
                    Owner: n.Owner,
                });
            }
            if (response.data.data.nfts.length < 1000) skip = -1;
            else skip += 1000;
            await wait(3000);
        }
    }
    return allNFTs;
};
