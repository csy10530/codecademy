const seriesRouter = require("express").Router();
const issuesRouter = require("./issues.js");
const sqlite3 = require("sqlite3");
const db = new sqlite3.Database(process.env.TEST_DATABASE || "./database.sqlite");

seriesRouter.use("/:seriesId/issues", issuesRouter);

seriesRouter.param("seriesId", (req, res, next, id) => {
    db.get("SELECT * FROM Series WHERE id = $id", {$id: id}, (err, row) => {
        if (err) {
            next(err);
        } else {
            if (!row) {
                res.sendStatus(404);
            } else {
                req.series = row;
                next();
            }
        }
    });
});

seriesRouter.get("/", (req, res, next) => {
   db.all("SELECT * FROM Series", (err, rows) => {
       if (err) {
           next(err);
       } else {
           res.status(200).json({series: rows});
       }
   });
});

seriesRouter.get("/:seriesId", (req, res, next) => {
    res.status(200).json({series: req.series});
});

const validateData = (req, res, next) => {
    if (!req.body.series.name || !req.body.series.description) {
        return res.sendStatus(400);
    }
    next();
};

seriesRouter.post("/", validateData, (req, res, next) => {
    db.run("INSERT INTO Series (name, description) VALUES ($name, $description)",
           {$name: req.body.series.name,
           $description: req.body.series.description},
           function (err) {
        if (err) {
            next(err);
        } else {
            db.get("SELECT * FROM Series WHERE id = $id", {$id: this.lastID}, (err, row) => {
                if (err) {
                    next(err);
                } else {
                    res.status(201).json({series: row});
                }
            });
        }
    });
});

seriesRouter.put("/:seriesId", validateData, (req, res, next) => {
    db.run("UPDATE Series SET name = $name, description = $description WHERE id = $id",
           {$name: req.body.series.name,
           $description: req.body.series.description,
           $id: req.params.seriesId},
           function (err) {
        if (err) {
            next(err);
        } else {
            db.get("SELECT * FROM Series WHERE id = $id", {$id: req.params.seriesId}, (err, row) => {
                if (err) {
                    next(err);
                } else {
                    res.status(200).json({series: row});
                }
            });
        }
    });
});

seriesRouter.delete("/:seriesId", (req, res, next) => {
   db.get("SELECT * FROM Issue WHERE series_id = $seriesId", {$seriesId: req.params.seriesId},
          (err, row) => {
       if (err) {
           next(err);
       } else {
           if (row) {
               res.sendStatus(400);
           } else {
               db.run("DELETE FROM Series WHERE id = $id", {$id: req.params.seriesId}, err => {
                   res.sendStatus(204);
               });
           }
       }
   });
});

module.exports = seriesRouter;