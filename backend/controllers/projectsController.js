import mongoose from "mongoose";
import { Project } from "../models/Project.js";

// to check the string is a valid mongoDb id:
function isValidId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}

// to load own projects:
export async function loadOwnedProjects(req, res) {
    if (!isValidId(req.params.id)) {
        res.status(400).json({ error: "Invalid id" })
        return null;
    };
    const project = await Project.findById(req.params.id);
    if (!project) {
        res.status(404).json({ error: "Project not found" });
        return null;
    }
    if (project.user.toString() !== req.user._id.toString()) {
        res.status(403).json({ error: "Forbidden" });
        return null;
    }
    return project;
}

// to get the list of project of that user:

export async function list(req, res, next) {
    try {
        const list = await Project.find({ user: req.user._id })
            .sort({ updatedAt: -1 })
            .limit(100);
        res.json({ projects: list.map((p) => p.toClient()) });
    } catch (err) {
        next(err);

    }
}

// to create new project: