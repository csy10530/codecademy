const artistRouter = require("express").Router();
const sqlite3 = require("sqlite3");
const db = new sqlite3.Database(process.env.TEST_DATABASE || "./database.sqlite");

artistRouter.param("artistId", (req, res, next, id) => {
    db.get("SELECT * FROM Artist WHERE id = $id", {$id: id}, (err, row) => {
        if (err) {
            next(err);
        } else {
            if (!row) {
                res.sendStatus(404);
            } else {
                req.artist = row;
                next();
            }
        }
    });
});

artistRouter.get("/", (req, res, next) => {
   db.all("SELECT * FROM Artist WHERE is_currently_employed = 1", (err, rows) => {
       if (err) {
           next(err);
       } else {
           res.status(200).json({artists: rows});
       }
   });
});

artistRouter.get("/:artistId", (req, res, next) => {
    res.status(200).json({artist: req.artist});
});

const validateData = (req, res, next) => {
    if (!req.body.artist.name || !req.body.artist.dateOfBirth || !req.body.artist.biography) {
        return res.sendStatus(400);
    }
    next();
};

artistRouter.post("/", validateData, (req, res, next) => {
    const isEmployed = req.body.artist.is_currently_employed === 0 ? 0 : 1;

    db.run("INSERT INTO Artist (name, date_of_birth, biography, is_currently_employed)"
           + "VALUES ($name, $dateOfBirth, $biography, $isEmployed)",
           {$name: req.body.artist.name,
               $dateOfBirth: req.body.artist.dateOfBirth,
               $biography: req.body.artist.biography,
               $isEmployed: isEmployed},
           function (err) {
        if (err) {
            next(err);
        } else {
            db.get("SELECT * FROM Artist WHERE id = $lastId", {$lastId: this.lastID}, (err, row) => {
                if (err) {
                    next(err);
                } else {
                    res.status(201).json({artist: row});
                }
            });
        }
    });
});

artistRouter.put("/:artistId", validateData, (req, res, next) => {
    const isEmployed = req.body.artist.is_currently_employed === 0 ? 0 : 1;

    db.run("UPDATE Artist SET name = $name, date_of_birth = $dateOfBirth, biography = $biography,"
           + "is_currently_employed = $isEmployed WHERE id = $id",
           {$name: req.body.artist.name,
               $dateOfBirth: req.body.artist.dateOfBirth,
               $biography: req.body.artist.biography,
               $isEmployed: isEmployed,
               $id: req.params.artistId}, function (err) {
        if (err) {
            next(err);
        } else {
           db.get("SELECT * FROM Artist WHERE id = $id", {$id: req.params.artistId}, (err, row) => {
              if (err) {
                  next(err);
              } else {
                  res.status(200).json({artist: row});
              }
           });
        }
    });
});

artistRouter.delete("/:artistId", (req, res, next) => {
    db.run("UPDATE Artist SET is_currently_employed = 0 WHERE id = $id",
           {$id: req.params.artistId},
           function (err) {
        if (err) {
            next(err);
        } else {
            db.get("SELECT * FROM Artist WHERE id = $id", {$id: req.params.artistId}, (err, row) => {
                if (err) {
                    next(err);
                } else {
                    res.status(200).json({artist: row});
                }
            });
        }
    });
});

module.exports = artistRouter;