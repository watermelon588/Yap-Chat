import pic1 from './pic1.jpg'
import pic2 from './pic2.jpg'
import pic3 from './pic3.jpg'
import pic4 from './pic4.jpg'
import pic5 from './pic5.jpg'
import pic6 from './pic6.jpg'
import pic7 from './pic7.jpg'
import pic8 from './pic8.jpg'
import vid1 from "./vid1.mp4";
import vid2 from "./vid2.mp4";
import img1 from './img1.jpg'
import img2 from './img2.jpg'
import menu_icon from "./menu_icon.png"
import logo1 from './logo1.png'
import logo2 from './logo2.png'
import logo3 from './logo2.svg'
import logo4 from './logo4.png'
import logo5 from './logo5.png'
import logo6 from './logo6.png'
import search_icon from './search_icon.png'
import y from './y.png'
import logo7 from './logo7.png'
import avatar_icon from './avatar_icon.png'
import arrow_icon from './arrow_icon.png'
import help_icon from './help_icon.png'
import profile_richard from './profile_richard.png'
import profile_alison from './profile_alison.png'
import profile_enrique from './profile_enrique.png'
import profile_marco from './profile_marco.png'
import profile_martin from './profile_martin.png'
import gallery_icon from './gallery_icon.svg'
import send_button from './send_button.svg'



const assets = {
    pic1,
    pic2,
    pic3,
    pic4,
    pic5,
    pic6,
    pic7,
    pic8,
    vid1,
    vid2,
    logo1,
    logo2,
    logo3,
    logo4,
    logo5,
    logo6,
    logo7,
    menu_icon,
    arrow_icon,
    help_icon,
    y,
    search_icon,
    avatar_icon,
    profile_martin,
    gallery_icon,
    send_button
}

export default assets;

export const imagesDummyData = [pic1,pic2,pic3,pic4,pic5,pic6,pic7,pic8]

export const userDummyData = [
    {
        "_id": "680f50aaf10f3cd28382ecf2",
        "email": "test1@greatstack.dev",
        "fullName": "Alison Martin",
        "profilePic": profile_alison,
        "bio": "Hi Everyone, I am Using QuickChat",
    },
    {
        "_id": "680f50e4f10f3cd28382ecf9",
        "email": "test2@greatstack.dev",
        "fullName": "Martin Johnson",
        "profilePic": profile_martin,
        "bio": "Hi Everyone, I am Using QuickChat",
    },
    {
        "_id": "680f510af10f3cd28382ed01",
        "email": "test3@greatstack.dev",
        "fullName": "Enrique Martinez",
        "profilePic": profile_enrique,
        "bio": "Hi Everyone, I am Using QuickChat",
    },
    {
        "_id": "680f5137f10f3cd28382ed10",
        "email": "test4@greatstack.dev",
        "fullName": "Marco Jones",
        "profilePic": profile_marco,
        "bio": "Hi Everyone, I am Using QuickChat",
    },
    {
        "_id": "680f516cf10f3cd28382ed11",
        "email": "test5@greatstack.dev",
        "fullName": "Richard Smith",
        "profilePic": profile_richard,
        "bio": "Hi Everyone, I am Using QuickChat",
    }
]

export const messagesDummyData = [
    {
        "_id": "680f571ff10f3cd28382f094",
        "senderId": "680f5116f10f3cd28382ed02",
        "receiverId": "680f50e4f10f3cd28382ecf9",
        "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "seen": true,
        "createdAt": "2025-04-28T10:23:27.844Z",
    },
    {
        "_id": "680f5726f10f3cd28382f0b1",
        "senderId": "680f50e4f10f3cd28382ecf9",
        "receiverId": "680f5116f10f3cd28382ed02",
        "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "seen": true,
        "createdAt": "2025-04-28T10:23:34.520Z",
    },
    {
        "_id": "680f5729f10f3cd28382f0b6",
        "senderId": "680f5116f10f3cd28382ed02",
        "receiverId": "680f50e4f10f3cd28382ecf9",
        "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "seen": true,
        "createdAt": "2025-04-28T10:23:37.301Z",
    },
    {
        "_id": "680f572cf10f3cd28382f0bb",
        "senderId": "680f50e4f10f3cd28382ecf9",
        "receiverId": "680f5116f10f3cd28382ed02",
        "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "seen": true,
        "createdAt": "2025-04-28T10:23:40.334Z",
    },
    {
        "_id": "680f573cf10f3cd28382f0c0",
        "senderId": "680f50e4f10f3cd28382ecf9",
        "receiverId": "680f5116f10f3cd28382ed02",
        "image": img1,
        "seen": true,
        "createdAt": "2025-04-28T10:23:56.265Z",
    },
    {
        "_id": "680f5745f10f3cd28382f0c5",
        "senderId": "680f5116f10f3cd28382ed02",
        "receiverId": "680f50e4f10f3cd28382ecf9",
        "image": img2,
        "seen": true,
        "createdAt": "2025-04-28T10:24:05.164Z",
    },
    {
        "_id": "680f5748f10f3cd28382f0ca",
        "senderId": "680f5116f10f3cd28382ed02",
        "receiverId": "680f50e4f10f3cd28382ecf9",
        "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "seen": true,
        "createdAt": "2025-04-28T10:24:08.523Z",
    }
]
