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

// add socket.io server
const io = require('socket.io')(server);

// connect to the database
// rethinkdbdash provides transparent connection pooling
const r = require('rethinkdbdash')({
  db: process.env.DATABASE_NAME || 'realtime_rethinkdb',
  servers: [{
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT) || 28015
  }]
});

// * DATABASE SETUP
// * visit data explorer at http://localhost:8080/#dataexplorer

// r.dbCreate('realtime_rethinkdb')
// r.db('realtime_rethinkdb').tableCreate('teams')
// r.db('realtime_rethinkdb').table('teams').indexCreate('clicks')
// r.db('realtime_rethinkdb').table('teams').indexCreate('name')


// * RETHINKDB QUERIES

// SELECT *
// FROM teams
// ORDER BY clicks DESC
// LIMIT 10;
function fetchLeaderboard() {
  return r.table('teams')
   .orderBy({ index: r.desc('clicks')})
   .limit(10);
};

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
    .run().then((result) => {
      return result.changes[0]['new_val'];
    });
};

function findOrCreateTeam(name) {
  return findTeamByName(name).catch((error) => {
    return createTeamWithName(name)
  });
}


// * CHANGEFEEDS
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

    stopWatching = () => cursor.close();
    cursor.each(callback);
  });

  return () => { stopWatching && stopWatching(); };
}

watchLeaderboard((err, changes) => {
  if (err) {
    console.error(err);
  } else {
    io.emit('teamUpdated', changes);
  }
});

io.on('connection', (socket) => {
  // send the current leaderboard on connection
  fetchLeaderboard().run().then((results) => {
    socket.emit('leaderboard', results);
  });

  let stopWatching = null;

  // User hit the 'Join Team' button
  socket.on('join', (data) => {
    findOrCreateTeam(data.name).then((team) => {
      // send initial state
      socket.emit('teamUpdated', team);

      // send any changes for *that* user
      // regardless of position on the leaderboard
      stopWatching = watchTeam(team, (err, team) => {
        socket.emit('teamUpdated', team);
      });
    });
  });

  // lets not keep these changefeeds ticking over if the user has left
  socket.on('logout',     () => { stopWatching && stopWatching(); });
  socket.on('disconnect', () => { stopWatching && stopWatching(); });

  socket.on('click', (data) => {
    incrementClicksForTeam(data.name);
  });
});
