const timesheetsRouter = require("express").Router({mergeParams: true});
const sqlite3 = require("sqlite3");

const db = new sqlite3.Database(process.env.TEST_DATABASE || "./database.sqlite");

timesheetsRouter.param("timesheetId", (req, res, next, id) => {
    db.get("SELECT * FROM Timesheet WHERE id = $id", {$id: id}, (err, row) => {
        if (err) {
            next(err);
        } else {
            if (row) {
                next();
            } else {
                res.sendStatus(404);
            }
        }
    });
});

timesheetsRouter.get("/", (req, res, next) => {
   db.all("SELECT * FROM Timesheet WHERE employee_id = $id", {$id: req.params.employeeId}, (err, rows) => {
       if (err) {
           next(err);
       } else {
           res.status(200).send({timesheets: rows});
       }
   });
});

const validateData = (req, res, next) => {
    if (!req.body.timesheet.hours || !req.body.timesheet.rate || !req.body.timesheet.date) {
        return res.sendStatus(400);
    }
    next();
};

timesheetsRouter.put("/:timesheetId", validateData, (req, res, next) => {
    db.run("UPDATE Timesheet SET hours = $hours, rate = $rate, date = $date WHERE id = $id", {
        $hours: req.body.timesheet.hours,
        $rate: req.body.timesheet.rate,
        $date: req.body.timesheet.date,
        $id: req.params.timesheetId
    }, err => {
        if (err) {
            next(err);
        } else {
            db.get("SELECT * FROM Timesheet WHERE id = $id", {$id: req.params.timesheetId}, (err, row) => {
                if (err) {
                    next(err);
                } else {
                    res.status(200).send({timesheet: row});
                }
            });
        }
    });
});

timesheetsRouter.post("/", validateData, (req, res, next) => {
   db.run("INSERT INTO Timesheet (hours, rate, date, employee_id) "
          + "VALUES ($hours, $rate, $date, $employee_id)", {
       $hours: req.body.timesheet.hours,
       $rate: req.body.timesheet.rate,
       $date: req.body.timesheet.date,
       $employee_id: req.params.employeeId}, function (err) {
       if (err) {
           next(err);
       } else {
           db.get("SELECT * FROM Timesheet WHERE id = $id", {$id: this.lastID}, (err, row) => {
               if (err) {
                   next(err);
               } else {
                   res.status(201).send({timesheet: row});
               }
           });
       }
   });
});

timesheetsRouter.delete("/:timesheetId", (req, res, next) => {
    db.run("DELETE FROM Timesheet WHERE id = $id", {$id: req.params.timesheetId}, err => {
        if (err) {
            next(err);
        } else {
            res.sendStatus(204);
        }
    });
});

module.exports = timesheetsRouter;