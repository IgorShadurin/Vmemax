import React from 'react';
import {Panel, Input, Button, FormLayoutGroup, PanelHeader, FormLayout, Spinner, ScreenSpinner } from '@vkontakte/vkui';
import Icon24Download from '@vkontakte/icons/dist/24/download';
import ReactCanvas from './ReactCanvas';
import connect from '@vkontakte/vkui-connect';


class Create extends React.Component {

    constructor(props) {
        super(props);

        this.actionServer = 'https://testeron.pro/';
        this.appId=6787772;
        //console.log(this.props.app);
       this.props.app.setState({
          createState:this
        });

        this.state = {
            topText: '',
            lowText: ''
            
        };

        this._handleLowInputChange = this._handleLowInputChange.bind(this);
        this._handleTopInputChange = this._handleTopInputChange.bind(this);
        this.connector = this.connector.bind(this);
        this.uploadFile = this.uploadFile.bind(this);
        this.vkOnUploadComplete = this.vkOnUploadComplete.bind(this);
        this.vkUploadPhoto = this.vkUploadPhoto.bind(this);
    }

    componentDidMount() {
        console.log('componentDidMount');
        if (!this.props.app.connectSubscribed) {
            console.log('Do subscribe');
            this.props.app.connectSubscribed= true;
            connect.subscribe(this.connector);
            //console.log(this.props.app);

        }
    }

    _handleTopInputChange(event) {
        this.setState({
            topText: event.target.value
        })
    }

    _handleLowInputChange(event) {
        this.setState({
            lowText: event.target.value
        })
    }

    connector(e) {
        let self = this.props.app.state.createState;

        switch (e.detail.type) {
            case 'VKWebAppGetUserInfoResult':
                console.log('VKWebAppGetUserInfoResult');
                console.log(e.detail.data);
                break;
            case 'VKWebAppInitResult':
                console.log('VKWebAppInitResult');
                console.log(e.detail.data);
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
            const url = data.response.upload_url;
            console.log('Upload url is: ' + url);
            console.log('File is');
            console.log(self.state.vkUploadFile);

            this.uploadServerVkFile(self.state.vkUploadFile, url)
                .then(result => self.vkUploadPhoto("on_uploaded_photo", result))
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
                 this.props.app.setState({ popout: null }) 
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

    _handleSaveButton() {
      // todo показать крутялку
    this.props.app.setState({ popout: <ScreenSpinner /> });
        let canvas = document.getElementById('memesCanvas');
        canvas.toBlob((result) => {
            console.log(result);
            this.uploadFile(result);
        }, 'image/jpeg');
       
        //console.log(canvasimage);

        //const w = window.open('about:blank', 'img');
        //w.document.write('<iframe src="' + canvasimage + '" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>')
    }


    render() {
        return (
            <Panel id={this.props.id}>
                <PanelHeader>
                    Создать Мем
                </PanelHeader>

                <main>
                    <ReactCanvas topText={this.state.topText} lowText={this.state.lowText}
                                 selectedImage={this.props.selectedImage}/>
                    <FormLayout>
                        <FormLayoutGroup top="Введите текст">
                            <Input maxLength='60' value={this.state.topText} onChange={this._handleTopInputChange}
                                   type="text" placeholder="Текст сверху"/>
                            <Input maxLength='60' value={this.state.lowText} onChange={this._handleLowInputChange}
                                   type="text" placeholder="Текст снизу"/>
                        </FormLayoutGroup>
                        <Button level="commerce" size="xl" before={<Icon24Download/>}
                                onClick={() => this._handleSaveButton()}>Сохранить</Button>
                    </FormLayout>

                </main>
            </Panel>
        )
    }

}


export default Create;