import {Component,type ReactNode} from 'react';
export default class SceneBoundary extends Component<{children:ReactNode},{failed:boolean}>{
 state={failed:false};
 static getDerivedStateFromError(){return {failed:true};}
 render(){return this.state.failed?<div className="scene-error" role="alert"><h2>O véu não pôde se abrir.</h2><p>O cenário precisa de WebGL. Ative a aceleração gráfica do navegador e recarregue a página.</p><button onClick={()=>window.location.reload()}>Tentar novamente</button></div>:this.props.children;}
}
