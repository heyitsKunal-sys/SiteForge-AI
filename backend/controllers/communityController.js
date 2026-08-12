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
        const items = await Project.find({ publised: true })
            .select("+likedBy")
            .sort(sortMap[sort] || sortMap.new)
            .limit(60)
            .populate("user", " name") //for the user field get user's name

        const meId = req.user?._id?.toString(); //is this project liked by me req.user._id  gives ObjectId("123") then coberted into string become "123"
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