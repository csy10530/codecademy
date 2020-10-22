const menuItemsRouter = require("express").Router({mergeParams: true});
const sqlite3 = require("sqlite3");

const db = new sqlite3.Database(process.env.TEST_DATABASE || "./database.sqlite");

menuItemsRouter.param("menuItemId", (req, res, next, id) => {
    db.get("SELECT * FROM MenuItem WHERE id = $id", {$id: id}, (err, row) => {
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

menuItemsRouter.get("/", (req, res, next) => {
    db.all("SELECT * FROM MenuItem WHERE menu_id = $id", {$id: req.params.menuId}, (err, rows) => {
        if (err) {
            next(err);
        } else {
            res.status(200).send({menuItems: rows});
        }
    });
});

const validateData = (req, res, next) => {
    if (!req.body.menuItem.name || !req.body.menuItem.inventory || !req.body.menuItem.price) {
        return res.sendStatus(400);
    }
    next();
};

menuItemsRouter.post("/", validateData, (req, res, next) => {
    db.run("INSERT INTO MenuItem (name, inventory, price, description, menu_id) VALUES "
           + "($name, $inventory, $price, $description, $menu_id)", {
        $name: req.body.menuItem.name,
        $inventory: req.body.menuItem.inventory,
        $price: req.body.menuItem.price,
        $description: req.body.menuItem.description,
        $menu_id: req.params.menuId
    }, function (err) {
        if (err) {
            next(err);
        } else {
            db.get("SELECT * FROM MenuItem WHERE id = $id", {$id: this.lastID}, (err, row) => {
                if (err) {
                    next(err);
                } else {
                    res.status(201).send({menuItem: row});
                }
            });
        }
    });
});

menuItemsRouter.put("/:menuItemId", validateData, (req, res, next) => {
    db.run("UPDATE MenuItem SET name = $name, inventory = $inventory, price = $price, "
           + "description = $description WHERE menu_id = $menu_id", {
        $name: req.body.menuItem.name,
        $inventory: req.body.menuItem.inventory,
        $price: req.body.menuItem.price,
        $description: req.body.menuItem.description,
        $menu_id: req.params.menuId
    }, err => {
        if (err) {
            next(err);
        } else {
            db.get("SELECT * FROM MenuItem WHERE id = $id", {$id: req.params.menuItemId}, (err, row) => {
                if (err) {
                    next(err);
                } else {
                    res.status(200).send({menuItem: row});
                }
            });
        }
    });
});

menuItemsRouter.delete("/:menuItemId", (req, res, next) => {
    db.run("DELETE FROM MenuItem WHERE id = $id", {$id: req.params.menuItemId}, err => {
        if (err) {
            next(err);
        } else {
            res.sendStatus(204);
        }
    });
});

module.exports = menuItemsRouter;