"use client"
import { fetchCommunityList } from "@/lib/actions/community.actions";
import { useEffect, useState } from "react";
import CommunityCard from "../cards/CommunityCard";
import { fetchAllUsers, fetchCurrentUserId } from "@/lib/actions/user.actions";
import UserCard from "../cards/UserCard";

function RightSidebar() {
    const [communitiesList, setCommunitiesList] = useState([{
        id: '',
        name: '',
        username: '',
        image: '',
        bio: '',
        members: [{ image: "" }],
    }]);
    const [currUser, setCurrUser] = useState("");
    const [usersList, setUsersList] = useState([{
        bio: '',
        id: '',
        image: '',
        name: '',
        onboarded: '',
        streaks: {},
        threads: [],
        username: '',
        _id: '',
    }])
    useEffect(() => {
        const fetchData = async () => {
            const result = JSON.parse(JSON.stringify(await fetchCommunityList()));
            setCommunitiesList(result);
            const currUserId = JSON.parse(JSON.stringify(await fetchCurrentUserId()));
            setCurrUser(currUserId);
            const userData = JSON.parse(JSON.stringify(await fetchAllUsers()));
            setUsersList(userData);
        }
        fetchData();
    },[])

    return (
        <section className="custom-scrollbar rightsidebar flex">
        <div className="flex flex-1 flex-col justify-start">
            <h3 className="text-heading4-medium text-light-1">Suggested Communities</h3>
            <div className="mt-3 h-[30vh] w-auto overflow-y-scroll scrollbar-hidden">
            {communitiesList.length > 0 && communitiesList.map((obj) => (
                <CommunityCard id={obj.id} name={obj.name} username={obj.username} imgUrl={obj.image} bio={obj.bio} members={obj.members} type="small" />
            ))}
            </div>
        </div>
        <div className="flex flex-1 flex-col justify-start">
            <h3 className="text-heading4-medium text-light-1">Suggested Users</h3>
            <div className="mt-3 h-[30vh] w-auto overflow-y-scroll scrollbar-hidden">
            {usersList.length > 0 && usersList.map((person) => (
                person.id !== currUser && <UserCard key={person.id} id={person.id} name={person.name} username={person.username} imgUrl={person.image} personType='User' type="small"/>
            ))}
            </div>
        </div>
        </section>
    )
}

export default RightSidebar;