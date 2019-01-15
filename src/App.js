import React from 'react';
import {View, Epic, Tabbar, TabbarItem, ScreenSpinner} from '@vkontakte/vkui';
import '@vkontakte/vkui/dist/vkui.css';
import Tape from './panels/Tape';
import Create from './panels/Create';
import Mymem from './panels/Mymem';
import connect from '@vkontakte/vkui-connect';
import Icon28Tape from '@vkontakte/icons/dist/28/newsfeed';
import Icon28Create from '@vkontakte/icons/dist/28/write';
import Icon28Mymem from '@vkontakte/icons/dist/28/document';


class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            activeStory: 'tape',
            selectedImage: null,
            createState: null,
            popout: null,
            apiToken: null,
            apiAlbumId: null,
            photos: []
        };

        //this.appId = 6787772;
        this.appId = 6763470;
        this.actionServer = 'https://testeron.pro/';

        this.connectSubscribed = false;
        this.onStoryChange = this.onStoryChange.bind(this);
        this.connector = this.connector.bind(this);
        this.uploadFile = this.uploadFile.bind(this);
        this.vkOnUploadComplete = this.vkOnUploadComplete.bind(this);
        this.vkUploadPhoto = this.vkUploadPhoto.bind(this);
        this.vkGetPhotos = this.vkGetPhotos.bind(this);
    }

    componentDidMount() {
        connect.subscribe(this.connector);
    }

    connector(e) {
        //let self = this.props.app.state.createState;
        let self = this;

        switch (e.detail.type) {
            case 'VKWebAppGetUserInfoResult':
                console.log('VKWebAppGetUserInfoResult');
                console.log(e.detail.data);
                break;
            case 'VKWebAppInitResult':
                console.log('VKWebAppInitResult');
                console.log(e);
                break;
            case 'VKWebAppCallAPIMethodFailed':
                console.log('VKWebAppCallAPIMethodFailed');
                console.log(e.detail.data);
                break;
            case 'VKWebAppAccessTokenReceived':
                console.log('VKWebAppAccessTokenReceived');
                const data = e.detail.data;
                console.log(data);
                self.vkReceiveToken("token_received", data);
                break;
            case 'VKWebAppCallAPIMethodResult':
                const answer = e.detail.data;
                console.log('VKWebAppCallAPIMethodResult');
                console.log(answer);
                if (answer.request_id === "get_albums") {
                    self.vkGetAlbumId('on_albums_received', answer);
                } else if (answer.request_id === "create_photoalbum") {
                    self.vkGetAlbumId('on_created_photoalbum', answer);
                } else if (answer.request_id === "get_upload_server") {
                    self.vkUploadPhoto('on_server_received', answer);
                } else if (answer.request_id === "photos_save") {
                    self.vkUploadPhoto('on_photo_saved', answer);
                } else if (answer.request_id === "get_photos") {
                    //self.vkUploadPhoto('on_photo_saved', answer);
                    self.setState({
                        photos: answer.response.items
                    });
                }

                break;
            default:
                console.log('log - ' + e.detail.type);
        }
    }

    uploadFile(file) {
        console.log('File received');
        console.log(file);
        this.setState({
            vkUploadFile: file
        });
        // todo change button with wait animation
        if (this.state.apiToken) {
            if (this.state.apiAlbumId) {
                this.vkUploadPhoto();
            } else {
                this.vkGetAlbumId();
            }
        } else {
            this.vkReceiveToken();
        }
    }

    vkReceiveToken(state, data) {
        const self = this;
        if (state === "token_received") {
            const token = data.access_token;
            self.setState({
                apiToken: token
            });
            self.vkGetAlbumId();
        } else {
            connect.send("VKWebAppGetAuthToken", {"app_id": this.appId, "scope": "photos"});
        }
    }

    vkGetAlbumId(state, data) {
        const self = this;
        if (this.state.apiAlbumId) {
            this.vkUploadPhoto();
        } else if (state === 'on_albums_received') {
            let testeronAlbum = data.response.items.filter(item => item.title === "Vmeme");
            testeronAlbum = testeronAlbum.length ? testeronAlbum[0] : null;
            if (testeronAlbum) {
                console.log('album found');
                self.setState({
                    apiAlbumId: testeronAlbum.id
                });
                self.vkUploadPhoto();
            } else {
                console.log('album not found, create');
                connect.send("VKWebAppCallAPIMethod", {
                    "method": "photos.createAlbum",
                    "params": {
                        "title": "Vmeme",
                        "description": "Это приватный альбом, созданный приложением Vmeme для хранения загруженных вами картинок.",
                        "privacy_view": "nobody",
                        "v": "5.92",
                        "access_token": self.state.apiToken
                    },
                    "request_id": "create_photoalbum"
                });
            }
        } else if (state === 'on_created_photoalbum') {
            self.setState({
                apiAlbumId: data.response.id
            });
            self.vkUploadPhoto();
        } else {
            connect.send("VKWebAppCallAPIMethod", {
                "method": "photos.getAlbums",
                "params": {"v": "5.92", "access_token": this.state.apiToken},
                "request_id": "get_albums"
            });
        }
    }

    vkUploadPhoto(state, data) {
        const self = this;
        console.log('Upload photo here!!!');
        if (state === "on_server_received") {
            this.vkGetPhotos();
            const url = data.response.upload_url;
            console.log('Upload url is: ' + url);
            console.log('File is');
            console.log(self.state.vkUploadFile);

            if (self.state.vkUploadFile) {
                this.uploadServerVkFile(self.state.vkUploadFile, url)
                    .then(result => self.vkUploadPhoto("on_uploaded_photo", result));
            }
        } else if (state === "on_uploaded_photo") {
            console.log(data);
            if (data.server && data.photos_list.length && data.hash) {
                console.log('Call photos SAVE!!!');
                connect.send("VKWebAppCallAPIMethod", {
                    "method": "photos.save",
                    "params": {
                        "album_id": self.state.apiAlbumId,
                        "server": data.server,
                        "photos_list": data.photos_list,
                        "hash": data.hash,
                        "v": "5.92",
                        "access_token": self.state.apiToken
                    },
                    "request_id": "photos_save"
                });
                // todo убрать крутялку и показать сообщение где мем
                this.vkGetPhotos();
                this.setState({popout: null});
            } else {
                alert('Не удалось загрузить фото. Попробуйте загрузить позже или выберите другой файл');
            }
        } else if (state === "on_photo_saved") {
            self.vkOnUploadComplete(data.response[0]);
        } else {
            connect.send("VKWebAppCallAPIMethod", {
                "method": "photos.getUploadServer",
                "params": {
                    "album_id": self.state.apiAlbumId,
                    "v": "5.92",
                    "access_token": self.state.apiToken
                },
                "request_id": "get_upload_server"
            });
        }

    }

    vkGetPhotos() {
        connect.send("VKWebAppCallAPIMethod", {
            "method": "photos.get",
            "params": {
                "album_id": this.state.apiAlbumId,
                "rev": 1,
                "photo_sizes": 1,
                "v": "5.92",
                "access_token": this.state.apiToken
            },
            "request_id": "get_photos"
        });
    }

    vkOnUploadComplete(data) {
        console.log('vkOnUploadComplete');
        //const type = this.state.vkUploadFileInfo.type;
        //const id = Number(this.state.vkUploadFileInfo.id);
        const image = data.sizes[data.sizes.length - 1].url;

        console.log(image);
        this.setState({
            image: image
        });

    }

    uploadServerVkFile(file, uploadUrl) {
        let data = new FormData();
        data.append('file', file, 'image.jpg');
        data.append('uploadUrl', uploadUrl);
        return fetch(this.actionServer + 'mem-vk/upload-server-vk-file', {
            //return fetch('http://localhost:8080/mem-vk/upload-server-vk-file', {
            method: 'POST',
            headers: {
                'Accept': 'application/json'
            },
            body: data
        })
            .then(data => data.json());
    }

    onStoryChange(e) {
        this.setState({activeStory: e.currentTarget.dataset.story})
    }

    render() {

        return (
            <Epic activeStory={this.state.activeStory} tabbar={
                <Tabbar>
                    <TabbarItem
                        onClick={this.onStoryChange}
                        selected={this.state.activeStory === 'tape'}
                        data-story="tape"
                    ><Icon28Tape/></TabbarItem>
                    <TabbarItem
                        onClick={this.onStoryChange}
                        selected={this.state.activeStory === 'create'}
                        data-story="create"
                    ><Icon28Create/></TabbarItem>
                    <TabbarItem
                        onClick={this.onStoryChange}
                        selected={this.state.activeStory === 'mymem'}
                        data-story="mymem"

                    ><Icon28Mymem/></TabbarItem>
                </Tabbar>

            }>
                <View id="tape" activePanel="tape">
                    <Tape id="tape" app={this}/>
                </View>
                <View popout={this.state.popout} id="create" activePanel="create">
                    <Create id="create" selectedImage={this.state.selectedImage} app={this}/>
                </View>
                <View id="mymem" activePanel="mymem">
                    <Mymem id="mymem" app={this}/>
                </View>

            </Epic>

        )
    }
}

export default App;
