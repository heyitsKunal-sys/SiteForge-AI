import { Router } from "express";

const router = Router({ mergeParams: true });

//  to publish the repo on github

export function githubRoute(loadOwnedProject) {
    return async (req, res, next) => {
        try {
            const project = await loadOwnedProjects(req, res);
            if (!project) return;
            if (!project.html || project.html.length < 100) {
                return res.status(400).json({ error: "Project has no generted HTML yet" })
            }
            const token = (req.body.token || "").trim();
            const repoName = (req.body.repoName || "").trim()
        } catch (err) {

        }
    }
}