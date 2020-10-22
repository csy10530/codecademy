const menusRouter = require("express").Router();
const sqlite3 = require("sqlite3");

const menuItemsRouter = require("./menu-items");

const db = new sqlite3.Database(process.env.TEST_DATABASE || "./database.sqlite");

menusRouter.use("/:menuId/menu-items", menuItemsRouter);

menusRouter.param("menuId", (req, res, next, id) => {
   db.get("SELECT * FROM Menu WHERE id = $id", {$id: id}, (err, row) => {
       if (err) {
           next(err);
       } else {
           if (row) {
               req.menu = row;
               next();
           } else {
               res.sendStatus(404);
           }
       }
   });
});

menusRouter.get("/", (req, res, next) => {
    db.all("SELECT * FROM Menu", (err, rows) => {
        if (err) {
            next(err);
        } else {
            res.status(200).send({menus: rows});
        }
    });
});

const validateData = (req, res, next) => {
    if (!req.body.menu.title) {
        return res.sendStatus(400);
    }
    next();
};

menusRouter.post("/", validateData, (req, res, next) => {
   db.run("INSERT INTO Menu (title) VALUES ($title)", {$title: req.body.menu.title}, function (err) {
       if (err) {
           next(err);
       } else {
           db.get("SELECT * FROM Menu WHERE id = $id", {$id: this.lastID}, (err, row) => {
               if (err) {
                   next(err);
               } else {
                   res.status(201).send({menu: row});
               }
           });
       }
   });
});

menusRouter.get("/:menuId", (req, res, next) => {
    res.status(200).send({menu: req.menu});
});

menusRouter.put("/:menuId", validateData, (req, res, next) => {
    db.run("UPDATE Menu SET title = $title WHERE id = $id", {
        $title: req.body.menu.title,
        $id: req.params.menuId}, err => {
        if (err) {
            next(err);
        } else {
            db.get("SELECT * FROM Menu WHERE id = $id", {$id: req.params.menuId}, (err, row) => {
                if (err) {
                    next(err);
                } else {
                    res.status(200).send({menu: row});
                }
            });
        }
    });
});

menusRouter.delete("/:menuId", (req, res, next) => {
    db.get("SELECT * FROM MenuItem WHERE menu_id = $id", {$id: req.params.menuId}, (err, row) => {
        if (err) {
            next(err);
        } else if (row) {
            res.sendStatus(400);
        } else {
            db.run("DELETE FROM Menu WHERE id = $id", {$id: req.params.menuId}, err => {
                if (err) {
                    next(err);
                } else {
                    res.sendStatus(204);
                }
            });
        }
    });
});


module.exports = menusRouter;