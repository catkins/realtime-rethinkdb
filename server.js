'use strict';

// standard express app plumbing
const express = require('express');
const app = express();
const morgan = require('morgan');
const path = require('path');

app.use(morgan('dev'));
app.use(express.static('dist'));

app.get('/', (req, res) => {
  let template = 'index.html';

  if (process.env.NODE_ENV === 'production') {
    template = 'index.prod.html';
  }

  res.sendFile(path.join(__dirname, 'static', template));
});

const server = app.listen(3000, () => {
  console.log(`Web server listening at http://localhost:${server.address().port}`);
});

// connect to the database
const r = require('rethinkdbdash')({
  db: process.env.DATABASE_NAME || 'realtime_rethinkdb',
  servers: [{
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT) || 28015
  }]
});

// SELECT *
// FROM teams
// ORDER BY clicks DESC
// LIMIT 10;
function fetchLeaderboard() {
  return r.table('teams')
   .orderBy({ index: r.desc('clicks')})
   .limit(10);
};

function watchLeaderboard(callback) {
  fetchLeaderboard()
  .changes()
  .map(r.row('new_val'))
  .run((err, cursor) => {
    if (err) {
      callback(err);
      return;
    }
    cursor.each(callback);
  });
};

function watchTeam(team, callback) {
  let stopWatching;

  r.table('teams')
  .get(team.id)
  .changes()
  .map(r.row('new_val'))
  .run((err, cursor) => {
    if (err) {
      callback(err);
      return;
    }

    stopWatching = cursor.close.bind(cursor);
    cursor.each(callback);
  });

  return () => { stopWatching && stopWatching(); };
}

// UPDATE teams
//    SET updated_at = now(),
//        clicks = clicks + 1
//  WHERE name = "Awesome Team";
function incrementClicksForTeam(name) {
  return r.table('teams')
    .filter({ name })
    .update({
      updatedAt: r.now(),
      clicks: r.row('clicks').add(1)
    })
    .run();
};

// SELECT *
// FROM teams
// WHERE name = "Awesome Team"
// LIMIT 1
const findTeamByName = (name) => {
  return r.table('teams')
   .filter({ name })
   .limit(1)
   .nth(0)
   .run();
};

// INSERT INTO teams(name, clicks)
// VALUES ("Awesome Team", 0)
function createTeamWithName(name) {
  return r.table('teams')
    .insert({ name, clicks: 0 }, { returnChanges: true })
    .run().then(result => {
      return result.changes[0]['new_val'];
    });
};

function findOrCreateTeam(name) {
  return findTeamByName(name).catch(error => {
    return createTeamWithName(name)
  });
}

