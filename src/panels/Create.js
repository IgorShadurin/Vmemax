import React from 'react';
import {Panel, Input, Button, FormLayoutGroup, PanelHeader, FormLayout, Spinner, ScreenSpinner} from '@vkontakte/vkui';
import Icon24Download from '@vkontakte/icons/dist/24/download';
import ReactCanvas from './ReactCanvas';
import connect from '@vkontakte/vkui-connect';


class Create extends React.Component {

    constructor(props) {
        super(props);

        //console.log(this.props.app);
        this.props.app.setState({
            createState: this
        });

        this.state = {
            topText: '',
            lowText: ''

        };

        this._handleLowInputChange = this._handleLowInputChange.bind(this);
        this._handleTopInputChange = this._handleTopInputChange.bind(this);
    }

    componentDidMount() {
        /*console.log('componentDidMount');
        if (!this.props.app.connectSubscribed) {
            console.log('Do subscribe');
            this.props.app.connectSubscribed = true;
            connect.subscribe(this.connector);
            //console.log(this.props.app);

        }*/
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

    _handleSaveButton() {
        // todo показать крутялку
        this.props.app.setState({popout: <ScreenSpinner/>});
        let canvas = document.getElementById('memesCanvas');
        canvas.toBlob((result) => {
            console.log(result);
            this.props.app.uploadFile(result);
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