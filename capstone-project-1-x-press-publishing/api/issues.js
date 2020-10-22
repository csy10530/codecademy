const issuesRouter = require("express").Router({mergeParams: true});
const sqlite3 = require("sqlite3");
const db = new sqlite3.Database(process.env.TEST_DATABASE || "./database.sqlite");

issuesRouter.param("issueId", (req, res, next, id) => {
    db.get("SELECT * FROM Issue WHERE id = $id", {$id: id}, (err, row) => {
        if (err) {
            next(err);
        } else {
            if (!row) {
                res.sendStatus(404);
            } else {
                next();
            }
        }
    });
});

issuesRouter.get("/", (req, res, next) => {
    db.all("SELECT * FROM Issue WHERE series_id = $seriesId", {$seriesId: req.params.seriesId},
           (err, rows) => {
        if (err) {
            next(err);
        } else {
            res.status(200).json({issues: rows});
        }
    });
});

const validateData = (req, res, next) => {
    if (!req.body.issue.name || !req.body.issue.issueNumber || !req.body.issue.artistId ||
        !req.body.issue.publicationDate) {
        return res.sendStatus(400);
    }

    db.get("SELECT * FROM Artist WHERE id = $id", {$id: req.body.issue.artistId}, (err, row) => {
        if (err) {
            next(err);
        } else {
            if (!row) {
                return res.sendStatus(400);
            } else {
                next();
            }
        }
    });
};

issuesRouter.post("/", validateData, (req, res, next) => {
   db.run("INSERT INTO Issue (name, issue_number, publication_date, artist_id, series_id) VALUES "
          + "($name, $issueNumber, $publicationDate, $artistId, $seriesId)",
          {$name: req.body.issue.name,
              $issueNumber: req.body.issue.issueNumber,
              $artistId: req.body.issue.artistId,
              $publicationDate: req.body.issue.publicationDate,
              $seriesId: req.params.seriesId}, function (err) {
       if (err) {
           next(err);
       } else {
           db.get("SELECT * FROM Issue WHERE id = $id", {$id: this.lastID}, (err, row) => {
               if (err) {
                   next(err);
               } else {
                   res.status(201).json({issue: row});
               }
           });
       }
   });
});

issuesRouter.put("/:issueId", validateData, (req, res, next) => {
    db.run("UPDATE Issue SET name = $name, issue_number = $issueNumber, "
           + "publication_date = $publicationDate, artist_id = $artistId WHERE id = $id",
           {$name: req.body.issue.name,
               $issueNumber: req.body.issue.issueNumber,
               $artistId: req.body.issue.artistId,
               $publicationDate: req.body.issue.publicationDate,
               $id: req.params.issueId}, function (err) {
        if (err) {
            next(err);
        } else {
            db.get("SELECT * FROM Issue WHERE id = $id", {$id: req.params.issueId}, (err, row) => {
                res.status(200).json({issue: row});
            });
        }
    });
});

issuesRouter.delete("/:issueId", (req, res, next) => {
   db.run("DELETE FROM Issue WHERE id = $id", {$id: req.params.issueId}, function (err) {
       if (err) {
           next(err);
       } else {
           res.sendStatus(204);
       }
   });
});

module.exports = issuesRouter;