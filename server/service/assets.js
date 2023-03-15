const { LicodeService } = require('./licode');
const licodeService = new LicodeService();

class AssetsService {
    constructor() {
        licodeService.open();
        this.category = category;
        this.assets = assets;
    }

    updatePeers() {
        let rtcs = []
        for (const theRoom of global.rooms.values()) {
            const roomId = theRoom._roomId;
            const room = rtcs.find(r => r.room === roomId);
            const members = theRoom._protooRoom.peers.map(peer => peer._id);
            if (!room) {
                rtcs.push({
                    room: roomId,
                    members
                })
            } else {
                room.members.push(...members);
                rtcs.push(room)
            }
        }
        rtcs = rtcs.filter(rtc => rtc.members.length > 0);
        this.assets['rtc'] = rtcs;

        const rtcCategory = this.category[0].children.find(c => c.title === 'RTC');
        rtcCategory.children = [];

        rtcs.forEach((rtc, index) => {
            if (rtc.room.startsWith('mixer')) return;
            rtcCategory.children.push({
                title: rtc.room,
                key: `0-0-0-` + index,
            })
        })

        this.syncAssets();
    }


    syncAssets() {
        const data = { category: this.category, assets: this.assets };
        licodeService.sendLicodeMessage(data)
    }

}


const category = [{
    title: "material",
    key: "0-0",
    children: [
        {
            title: "RTC",
            key: "0-0-0",
            children: [
            ]
        },
        {
            title: "videos",
            key: "0-0-1",
        },
        {
            title: "audios",
            key: "0-0-2",
        },
        {
            title: "images",
            key: "0-0-3",
        },
        {
            title: "subtitles",
            key: "0-0-4",
        },
    ],
}]




const assets = {
    videos: [
        {
            id: 1,
            previewImage: 'https://www.baidu.com/img/bd_logo1.png',
            url: 'https://chaosyhy.com:60125/files/resources/40_input.mp4',
            path: '/opt/application/tx-rtcStream/files/resources/40_input.mp4',
            title: '40s时钟视频'
        },
        {
            id: 2,
            previewImage: 'https://www.baidu.com/img/bd_logo1.png',
            url: 'https://chaosyhy.com:60125/files/resources/forest.mp4',
            path: '/opt/application/tx-rtcStream/files/resources/forest.mp4',
            title: '森林'
        },
        {
            id: 3,
            previewImage: 'https://www.baidu.com/img/bd_logo1.png',
            url: 'https://chaosyhy.com:60125/files/resources/20_input.mp4',
            path: '/opt/application/tx-rtcStream/files/resources/20_input.mp4',
            title: '20s时钟视频'
        },
        {
            id: 4,
            previewImage: 'https://www.baidu.com/img/bd_logo1.png',
            url: 'https://chaosyhy.com:60125/files/resources/video2.mp4',
            path: '/opt/application/tx-rtcStream/files/resources/video2.mp4',
            title: '电脑屏幕'
        },
        {
            id: 5,
            previewImage: 'https://www.baidu.com/img/bd_logo1.png',
            url: 'https://chaosyhy.com:60125/files/resources/dh.mp4',
            path: '/opt/application/tx-rtcStream/files/resources/dh.mp4',
            title: '本地数字人'
        },
        {
            id: 6,
            previewImage: 'https://www.baidu.com/img/bd_logo1.png',
            url: 'https://chaosyhy.com:60125/files/resources/testsrc_1280x960_30p.mp4',
            path: '/opt/application/tx-rtcStream/files/resources/testsrc_1280x960_30p.mp4',
            title: '1280P时钟'
        },

    ],
    images: [
        {
            id: 1,
            previewImage: 'https://chaosyhy.com:60125/files/resources/fileimage.png',
            url: 'https://chaosyhy.com:60125/files/resources/fileimage.png',
            path: '/opt/application/tx-rtcStream/files/resources/fileimage.jpg',
            title: '流控制器'
        },
        {
            id: 2,
            previewImage: 'https://chaosyhy.com:60125/files/resources/image1.jpg',
            url: 'https://chaosyhy.com:60125/files/resources/image1.jpg',
            path: '/opt/application/tx-rtcStream/files/resources/image1.jpg',
            title: '拉萨'
        },
        {
            id: 3,
            previewImage: 'https://alifei05.cfp.cn/creative/vcg/veer/1600water/veer-412747764.jpg',
            url: 'https://alifei05.cfp.cn/creative/vcg/veer/1600water/veer-412747764.jpg',
            path: 'https://alifei05.cfp.cn/creative/vcg/veer/1600water/veer-412747764.jpg',
            title: '网络图片'
        },
        {
            id: 4,
            previewImage: 'https://chaosyhy.com:60125/files/resources/image2.jpg',
            url: 'https://chaosyhy.com:60125/files/resources/image2.jpg',
            path: '/opt/application/tx-rtcStream/files/resources/image2.jpg',
            title: '深山'
        },
        {
            id: 5,
            previewImage: 'https://chaosyhy.com:60125/files/resources/gif.gif',
            url: 'https://chaosyhy.com:60125/files/resources/gif.gif',
            path: '/opt/application/tx-rtcStream/files/resources/gif.gif',
            title: '动态图'
        }
    ],
    audios: [
        {
            id: 1,
            previewImage: 'https://chaosyhy.com:60125/files/resources/fileimage.png',
            url: 'https://chaosyhy.com:60125/files/resources/彩虹.mp3',
            path: '/opt/application/tx-rtcStream/files/resources/彩虹.mp3',
            title: '周杰伦-彩虹'
        },
        {
            id: 2,
            previewImage: 'https://chaosyhy.com:60125/files/resources/fileimage.png',
            url: 'https://chaosyhy.com:60125/files/resources/成都.mp3',
            path: '/opt/application/tx-rtcStream/files/resources/成都.mp3',
            title: '赵雷-成都'
        }
    ],
    subtitles: [
        {
            id: 1,
            previewImage: 'https://chaosyhy.com:60125/files/resources/fileimage.png',
            url: 'https://chaosyhy.com:60125/files/resources/subtitles.srt',
            path: '/opt/application/tx-rtcStream/files/resources/subtitles.srt',
            title: '字幕'
        },
    ],
    rtc: [
        {
            room: 'room1',
            members: ['user11', 'user12']
        },
        {
            room: 'room2',
            members: ['user21', 'user22']
        }
    ]

}



module.exports.AssetsService = AssetsService;