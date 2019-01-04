import React from 'react';
import { Panel, Div, PanelHeader } from '@vkontakte/vkui';
import picter1 from '../img/1.jpg';
import picter2 from '../img/2.jpg';
import picter3 from '../img/3.jpg';
import picter4 from '../img/4.jpg';
import picter5 from '../img/5.jpg';
import Gallery from 'react-photo-gallery';

const PHOTO_SET = [
  {
    src: picter1,
    width: 1,
    height: 0.8
  },
  {
    src: picter2,
    width: 2,
    height: 1
  },
  {
    src: picter3,
    width: 2,
    height: 1
  },
  {
    src: picter4,
    width: 3,
    height: 2
  },
  {
    src: picter5,
    width: 2,
    height: 1
  }
];
class Tape extends React.Component {
	constructor(props){
		super(props);
			this.state = {			
		
	}
}
drawThisImage(image) {
this.props.app.setState({
selectedImage: image,
activeStory:'create'
})

}
render () {
return (
	<Panel id={this.props.id}>
		<PanelHeader>Шаблоны</PanelHeader>
		
			<Div>
				
				<Gallery photos={PHOTO_SET} onClick = {(index)=>{this.drawThisImage(index.target.src)}}/>
			</Div>
		
	</Panel>
)
}
}
export default Tape;
