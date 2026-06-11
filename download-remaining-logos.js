const fs = require('fs');
const path = require('path');
const https = require('https');

const dataDir = path.join(__dirname, 'src/lib/data');
const logosDir = path.join(__dirname, 'public/logos');

const teamsFile = fs.readFileSync(path.join(dataDir, 'teams.ts'), 'utf-8');
const teamMatches = teamsFile.matchAll(/t\("([A-Z]{3})",\s*"([^"]+)"/g);
const teams = [];
for (const match of teamMatches) {
  teams.push({ code: match[1].toLowerCase(), name: match[2] });
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      if (res.statusCode !== 200) {
          resolve(null);
          return;
      }
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
          try {
              resolve(JSON.parse(data));
          } catch(e) {
              resolve(null); // Return null on JSON parse error (e.g. Cloudflare HTML)
          }
      });
    }).on('error', reject);
  });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      res.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
}

async function processTeams() {
  for (const team of teams) {
    const dest = path.join(logosDir, `${team.code}.png`);
    if (fs.existsSync(dest)) {
      continue;
    }

    try {
      await new Promise(r => setTimeout(r, 2500)); // 2.5s delay to avoid 1015 limits
      
      const searchName = encodeURIComponent(team.name);
      const url = `https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${searchName}`;
      const data = await fetchJson(url);

      if (data && data.teams && data.teams.length > 0) {
        let bestTeam = data.teams.find(t => 
          (t.strLeague && t.strLeague.includes("World Cup")) || 
          (t.strCountry === team.name) ||
          (t.strTeam === team.name)
        ) || data.teams[0];

        if (bestTeam && bestTeam.strBadge) {
          console.log(`[DOWNLOADING] ${team.name} (${team.code}) -> ${bestTeam.strBadge}`);
          await downloadFile(bestTeam.strBadge, dest);
        } else {
          console.log(`[NO BADGE] ${team.name} (${team.code})`);
        }
      } else {
        console.log(`[NOT FOUND] ${team.name} (${team.code})`);
      }
    } catch (e) {
      console.error(`[ERROR] Failed for ${team.name} (${team.code}):`, e.message);
    }
  }
  console.log("Finished downloading logos.");
}

processTeams();
