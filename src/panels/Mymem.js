import React from 'react';
import {Panel, Div, PanelHeader} from '@vkontakte/vkui';
import connect from "@vkontakte/vkui-connect/index";

const Mem = (props) => {
    return <Div key={props.key}><img src={props.image} alt=""/></Div>;
};


class Mymem extends React.Component {
    componentDidMount() {
        //connect.subscribe(this.connector);
        console.log('componentDidMount');
        if (this.props.app.state.apiToken && this.props.app.state.apiAlbumId) {
            this.props.app.vkGetPhotos();
        } else {
            this.props.app.vkReceiveToken();
        }
    }

    render() {
        const {id} = this.props;
        const photos = this.props.app.state.photos.map(item => item.sizes[item.sizes.length - 1].url);
        const photosHtml = photos.map((item, i) => <Mem image={item} key={i}/>);
        console.log(photos);
        console.log(photosHtml);

        return (
            <Panel id={id}>
                <PanelHeader>Мои Мемы</PanelHeader>

                <Div>
                    Мемов в альбоме {this.props.app.state.photos.length}
                </Div>

                {photosHtml}

            </Panel>
        );
    }
}

export default Mymem;
