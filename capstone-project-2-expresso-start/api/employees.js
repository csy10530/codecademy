const employeesRouter = require("express").Router();
const sqlite3 = require("sqlite3");

const timesheetsRouter = require("./timesheets");

const db = new sqlite3.Database(process.env.TEST_DATABASE || "./database.sqlite");

employeesRouter.use("/:employeeId/timesheets", timesheetsRouter);

employeesRouter.param("employeeId", (req, res, next, id) => {
    db.get("SELECT * FROM Employee WHERE id = $id", {$id: id}, (err, row) => {
        if (err) {
            next(err);
        } else {
            if (row) {
                req.employee = row;
                next();
            } else {
                res.sendStatus(404);
            }
        }
    });
});

employeesRouter.get("/", (req, res, next) => {
   db.all("SELECT * FROM Employee WHERE is_current_employee = 1", (err, rows) => {
       if (err) {
           next(err);
       } else {
           res.status(200).send({employees: rows});
       }
   });
});

employeesRouter.get("/:employeeId", (req, res, next) => {
   res.status(200).send({employee: req.employee});
});

const validateData = (req, res, next) => {
    if (!req.body.employee.name || !req.body.employee.position || !req.body.employee.wage) {
        return res.sendStatus(400);
    }
    next();
};

employeesRouter.post("/", validateData, (req, res, next) => {
   db.run("INSERT INTO Employee (name, position, wage) VALUES ($name, $position, $wage)", {
       $name: req.body.employee.name,
       $position: req.body.employee.position,
       $wage: req.body.employee.wage
   }, function (err) {
       if (err) {
           next(err);
       } else {
           db.get("SELECT * FROM Employee WHERE id = $id", {$id: this.lastID}, (err, row) => {
               if (err) {
                   next(err);
               } else {
                   res.status(201).send({employee: row});
               }
           });
       }
    });
});

employeesRouter.put("/:employeeId", validateData, (req, res, next) => {
   db.run("UPDATE Employee SET name = $name, position = $position, wage = $wage WHERE id = $id", {
       $name: req.body.employee.name,
       $position: req.body.employee.position,
       $wage: req.body.employee.wage,
       $id: req.params.employeeId
   }, function (err) {
       if (err) {
           next(err);
       } else {
           db.get("SELECT * FROM Employee WHERE id = $id", {$id: req.params.employeeId}, (err, row) => {
              if (err) {
                  next(err);
              } else {
                  res.status(200).send({employee: row});
              }
           });
       }
   });
});

employeesRouter.delete("/:employeeId", (req, res, next) => {
    db.run("UPDATE Employee SET is_current_employee = 0 WHERE id = $id",
           {$id: req.params.employeeId}, function (err) {
        if (err) {
            next(err);
        } else {
            db.get("SELECT * FROM Employee WHERE id = $id", {$id: req.params.employeeId}, (err, row) => {
                if (err) {
                    next(err);
                } else {
                    res.status(200).send({employee: row});
                }
            });
        }
    });
});

module.exports = employeesRouter;