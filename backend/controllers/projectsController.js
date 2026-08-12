import mongoose from "mongoose";
import { Project } from "../models/Project.js";
import { enhancePrompt, generateSite , postProcess } from "../utils/services.js";

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
export async function create(req, res, next) {
    try {
        const prompt = (req.body.prompt || "").trim();
        const name = (req.body.name || "").trim();
        if (!prompt) return res.status(400).json({ error: "Prompt is required" });
        if (prompt.length > 2000)
            return res.status(400).json({ error: "Prompt is too long (max 2000 character)" })
        const project = await Project.create({
            user : req.user._id,
            name: name || prompt.split(/[.!?]/)[0].slice(0, 60) || "Untitled Project",
            prompt,
            messages: [{ role: "user", text: prompt }]
        })
        res.status(201).json({ project: project.toClient() })
    }
    catch (err) {
        next(err)
    }
}


//  return a single project user owns

export async function get(req, res, next) {
    try {
        const project = await loadOwnedProjects(req, res);
        if (!project) return;
        res.json({ project: project.toClient() });
    } catch (err) {
        next(err)
    }
}

// update a project:

export async function update(req, res, next) {
    try {
        const project = await loadOwnedProjects(req, res);
        if (req.body.name !== undefined) {
            const name = String(req.body.name).trim();
            if (!name || name.length > 80)
                return res.status(400).json({ error: "Nmae must be 1-80 character" })
            project.name = name;
        }
        if (req.body.html !== undefined) {
            const html = String(req.body.html).trim();
            if (html.length > 500_000)
                return res.status(400).json({ error: "Html is too long" });
            project.html = html;

        }
        if (req.body.published !== undefined) {
            const published = Boolean(req.body.published);
            project.published = published;
            project.publishedAt = published ? new Date() : null;

        }
        await project.save();
        res.json({ project: project.toClient() })


    } catch (err) {
        next(err)
    }
}

//  to delete user project:

export async function remove(req, res, next) {
    try {
        const project = await loadOwnedProjects(req, res);
        if (!project) return;
        await project.deleteOne();

        res.json({ ok: true });

    } catch (err) {
        next(err);
    }
}

//  to collapse whitespaces for html scripts :

function visibleText(html) {
    if (!html) return "";
    return html
        .replace(/<script[\s\S]*? <\/script>/gi, "")  //.replace()  removes J.S from html because script code is not visible to user
        .replace(/<style[\s\S]*? <\/style>/gi, "") // here style content is removed no css is shown
        .replace(/<[^>]+>/g, " ") //removes html tag  suppose we have <div> hello kunal</div> it removes div and only shows hello kunal
        .replace(/\s+/g, " ") //collapse multiple spaces : kunal    is  a           ... it becomes kunal is a (mtlv ek line ya ek space me le ata ha)
        .trim(); //remove spaces from beginning to enf

}

// to build and edit tha html of site and charge credits

export async function generate(req, res, next) {
    try {
        const project = await loadOwnedProject(req, res);
        if (!project) return;

        const isFirstGeneration = !project.html || project.html.length < 100;
        const cost = isFirstGeneration ? 5 : 2; // 5 credits for first time generation 5 credit and 2 for update
        if ((req.user.credits ?? 0) < cost)
            return res.status(402).json({
                error: `You need at least ${cost} credit${cost === 1 ? "" : "s"} ${isFirstGeneration ? "for a new site" : "for changes"}. Top up to continue.`,
                cost,
            });
        const prompt = (req.body.prompt || "").trim();
        if (!prompt) return res.status(400).json({ error: "Prompt is required." });
        if (prompt.length > 2000)
            return res
                .status(400)
                .json({ error: "Prompt is too long (max 2000 characters)." });


        const last = project.messages[project.messages.length - 1];
        if (!last || last.role !== "user" || last.text !== prompt) {
            project.messages.push({ role: "user", text: prompt });
        }

        const originalPrompt = project.prompt || prompt;

        let brief;
        if (isFirstGeneration) {
            const enhanceResult = await enhancePrompt(prompt);
            project.enhancedPrompt = enhanceResult.text;
            brief = enhanceResult.text;
        } else {
            brief = prompt;
        }

        const genResult = await generateSite(brief, {
            previousHtml: project.html,
            history: project.messages,
            originalPrompt,
        });


        const isRealLlm = genResult.source === "llm";
        const tooShort = !genResult.html || genResult.html.length < 500;
        const visibleLen = visibleText(genResult.html).length;
        const hasAnyHeading = /<h[1-3]\b/i.test(genResult.html || "");
        const sectionCount = (genResult.html?.match(/<section\b/gi) || []).length;
        const badOutput =
            tooShort || visibleLen < 200 || (!hasAnyHeading && sectionCount < 1);
        const truncated = Boolean(genResult.truncated);
        const hadWorkingSite = Boolean(project.html && project.html.length > 200);


        let outcome;
        if (hadWorkingSite && (!isRealLlm || badOutput || truncated)) {

            outcome = "keptPrevious";
        } else if (!isRealLlm || badOutput) {
            project.html = isRealLlm
                ? postProcess(generateMockSite(originalPrompt))
                : genResult.html;
            outcome = "template";
        } else if (truncated) {
            project.html = genResult.html;
            outcome = "incomplete";
        } else {
            project.html = genResult.html;
            outcome = "saved";
        }
        if (outcome !== "saved")
            console.warn(
                `[generate] outcome=${outcome} source=${genResult.source} htmlLen=${genResult.html?.length || 0}`,
            );

        let assistantText;
        if (outcome === "saved") {
            assistantText =
                genResult.summary && genResult.summary.length > 20
                    ? genResult.summary
                    : "Done — I built your site.";
        } else if (outcome === "keptPrevious") {
            assistantText =
                "That update came back incomplete, so I kept your current site unchanged — please try again in a moment.";
        } else if (outcome === "incomplete") {
            assistantText =
                "Your site is ready, but it came out a little cut off — try again and I'll complete it.";
        } else if (genResult.source === "mock-no-key") {
            assistantText =
                "No AI provider is configured on the server, so I used a starter template.";
        } else {
            assistantText =
                "The AI was busy just now, so I used a starter template — please try again in a moment.";
        }

        project.messages.push({ role: "assistant", text: assistantText });
        if (!project.prompt) project.prompt = prompt;
        await project.save();

        if (outcome === "saved") {
            req.user.credits = Math.max(0, req.user.credits - cost);
            await req.user.save();
        }

        res.json({ project: project.toClient(), user: req.user.toClient() });
    } catch (err) {
        next(err);
    }
}