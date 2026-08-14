import mongoose from "mongoose";
import { Project } from "../models/Project.js";

// to get publish project

export async function list(req, res, next) {
    try {
        const sort = req.query.sort || "new";
        const sortMap = {
            new: { publishedAt: -1, createdAt: -1 },
            views: { publishedAt: -1, views: -1 },
            likes: { likes: -1, publishedAt: -1 },
        }
        const items = await Project.find({ published: true })
            .select("+likedBy")
            .sort(sortMap[sort] || sortMap.new)
            .limit(60)
            .populate("user", " name") //for the user field get user's name

        const meId = req.user?._id?.toString(); //is this project liked by me req.user._id  gives ObjectId("123") then converted into string become "123"
        const projects = items.map((p) => {
            const card = p.toPublicCard({ withHtml: true });// take this project and prepare safe info that should be shown publicaly for eg: object project might contain name ,html,user,likedBY etc .. so toPublicCard() might only return name, views, likes
            card.isOwn = Boolean(meId && p.user?._id?.toString() === meId); // does this project belomgs to the current logged-in user: p.user._id: "123" and meId="123" therefore "123"==="123" which is true so card.isOwn = true.
            card.likedByMe = Boolean( //check whether i liked it
                meId && (p.likedBy || []).some((id) => id.toString() == meId),  // imagine p.likedBy=["111","222","333"] and meId="222" .some()checks does at least ONE item satisfy this condition? So p.likedBy.some(id => id.toString()===meId) checks 111===222 No , 222===222 true
            );
            return card;

        })
        res.json({ projects })// now backend send the projects to frontend ...response looks roughly like: { "projects" : [ {"name":"portfolio","views":20,"likes":10,"isOwn": true,"likedByMe": false}]}

    } catch (err) {
        next(err)
    }
}

// to get one published project:
export async function get(req, res, next) {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) //suppose your API url is"  GET/projects/64abc123...... The :id part is avaialble as req.params.id            req.params.id: means give me the ID that came from the URL. then mongoose.Types.ObjectId.isValid(..) checks does this look like a valid MOngoDB objectId?
            return res.status(400).json({ error: "INvalid ID" })
        const project = await Project.findById(req.params.id) //MongoDB ,find the project whose _id equals the ID from the url 
            .select("+viewedBy +likedBy")
            .populate("user", "name")

        if (!project || !project.published)
            return res.status(404).json({ error: "Not found" });

        const meId = req.user?._id?.toString(); //meId:"222"
        const ownerId = project.user?._id?.toString();  //ownerId: "333"
        const isOwn = Boolean(meId && ownerId === meId); //isOwn : false but if ownerId is 222 then its true
        const alreadyViewed = //project.viewedBy :["111","222","333"] and current user is meId:222 .some() ask does at least one ID in viewedBy match my ID??
            meId && (project.viewedBy || []).some((id) => id.toString() === meId); //if the "222" matches with "222" means already and if the user id isnt in the array alreadyView is false

        if (meId && !isOwn && !alreadyViewed) {
            await Project.updateOne(
                { _id: project._id },
                {
                    $addToSet: {  //add this user's ID to viewedBy , but dont add it if its already viewed. So (Before: viewedBy: "111", "222" now viewedBy:'111',"222","333")if 333 again view No duplicate
                        viewedBy: req.user._id
                    },
                    $inc: {
                        views: 1  //inc view by 1
                    }
                }
            )
            project.views += 1   //this updates the JS object in the memory beacuse mongodb object is updated by $inc: {} but the project variable still contains the old value
        }
        const likedByMe = Boolean(
            meId && (project.likedBy || []).some((id) => id.toString() === meId)
        );
        res.json({
            project: {
                ...project.toPublicCard(),  //take all the public project info
                html: project.html,
                isOwn,
                likedByMe
            }
        })
    }
    catch (err) {
        next(err)
    }
}


// to toggle like or unlike project
export async function toggleLike(req, res, next) {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id))
            return res.status(400).json({ error: "Invalid id" });
        const project = await Project.findOne({
            _id: req.params.id,
            published: true,
        }).select("+likedBy");
        if (!project) return res.status(404).json({ error: "Not found" });

        const meId = req.user._id.toString();

        if (project.user.toString() === meId)
            return res.status(403).json({ error: "You can't like your own project" });

        const idx = (project.likedBy || []).findIndex(
            (id) => id.toString() === meId,
        );
        let liked;
        if (idx === -1) {
            await Project.updateOne(
                { _id: project._id },
                { $addToSet: { likedBy: req.user._id }, $inc: { likes: 1 } },
            );
            liked = true;
        } else {
            await Project.updateOne(
                { _id: project._id },
                { $pull: { likedBy: req.user._id }, $inc: { likes: -1 } },
            );
            liked = false;
        }
        const fresh = await Project.findById(project._id).select("likes");
        res.json({ likes: Math.max(0, fresh?.likes ?? 0), liked });
    } catch (err) {
        next(err);
    }
}