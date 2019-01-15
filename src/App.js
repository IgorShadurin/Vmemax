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
            createState:null,
            popout: null
        };

        this.connectSubscribed=false;
        this.onStoryChange = this.onStoryChange.bind(this);
        this.connector = this.connector.bind(this);

    }

 componentDidMount() {
        console.log('11 componentDidMount');
            console.log('Do subscribe');
            connect.subscribe(this.connector);

            connect.send("VKWebAppCallAPIMethod", {
                    "method": "photos.createAlbum",
                    "params": {
                        "title": "Vmeme",
                        "description": "Это приватный альбом, созданный приложением Vmeme для хранения загруженных вами картинок.",
                        "privacy_view": "nobody",
                        "v": "5.92",
                        "access_token": self.state.apiToken
                    },
                    "request_id": "get_photos"
                });
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
            case 'VKWebAppCallAPIMethodResult':
                const answer = e.detail.data;
                console.log('VKWebAppCallAPIMethodResult');
                console.log(answer);
                if (answer.request_id === "get_photos") {
                    //self.vkGetAlbumId('on_albums_received', answer);
                } 

                break;
            default:
                console.log('log - ' + e.detail.type);
        }
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
                    <Mymem id="mymem"/>
                </View>

            </Epic>

        )
    }
}

export default App;
