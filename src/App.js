import React from 'react';
import {View, Epic, Tabbar, TabbarItem} from '@vkontakte/vkui';
import '@vkontakte/vkui/dist/vkui.css';
import Tape from './panels/Tape';
import Create from './panels/Create';
import Mymem from './panels/Mymem';

import Icon28Tape from '@vkontakte/icons/dist/28/newsfeed';
import Icon28Create from '@vkontakte/icons/dist/28/write';
import Icon28Mymem from '@vkontakte/icons/dist/28/document';


class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            activeStory: 'tape',
            selectedImage: null,
            createState:null
        };

        this.connectSubscribed=false;
        this.onStoryChange = this.onStoryChange.bind(this);
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
                <View id="create" activePanel="create">
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
