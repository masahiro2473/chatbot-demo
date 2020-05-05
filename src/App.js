import React from 'react';
import './styles/style.css';
//エントリーポイントを創ることでimportを複数行書く必要がなくなり見た目もすっきりして分かりやすくなる
import {AnswersList,Chats} from "./components/index";
import FormDialog from './components/Forms/FormDialog';
//
import {db} from './firebase/index';

  export default class App extends React.Component{
  constructor(props){
    super(props);
    this.state={
      answers:[],
      chats:[],
      currentId:"init",
      dataSet:{} ,
      open:false
    }
    this.selectAnswer = this.selectAnswer.bind(this)
    //クラスコンポーネントで関数を使う時にはbindを押してあげる必要がある。
    this.handleClose = this.handleClose.bind(this)
    this.handleClickOpen = this.handleClickOpen.bind(this)
    //↑handleCloseという関数がbindされた
  }
  
  //次の質問
  displayNextQuestion = (nextQuestionId)=>{
    const chats = this.state.chats
    chats.push({
      text:this.state.dataSet[nextQuestionId].question,
      type:'question'
    })
    this.setState({
      answers:this.state.dataSet[nextQuestionId].answers,
      chats:chats,
      currentId:nextQuestionId
    })
  }

  selectAnswer = (selectAnswer,nextQuestionId) =>{
    switch(true){
      case (nextQuestionId === 'init'):
        //チャットの遅延表示
        setTimeout(() => this.displayNextQuestion(nextQuestionId),1000)
      break;

      case (/^https:*/.test(nextQuestionId)):
        const a =document.createElement('a');
        a.href=nextQuestionId;
        //別タブで開く
        a.target = '_blank';
        a.click();
        break;

      case(nextQuestionId === 'contact'):
      this.handleClickOpen()
      break;

      default:
    
        const chats = this.state.chats;
        chats.push({
          text: selectAnswer,
          type: 'answer'
        })
        this.setState({
          chats: chats
        })

        //チャットの遅延表示
        setTimeout(() => this.displayNextQuestion(nextQuestionId),1000)
        break;
    }
  }

  //ハンドルクリックオープンがtrueになったらモーダルが開かれる
  handleClickOpen = () => {
    this.setState({open:true});

  };
  //ハンドルクリックオープンがfalseになったらモーダルが閉じる
  handleClose = () => {
    this.setState({open:false});
  };

  initDataset = (dataset) =>{
    this.setState({datase:dataset})
  }

 componentDidMount(){
   //ライフサイクル内で非同期処理を制御
   (async() => {
      const dataset = this.state.dataSet

      await db.collection('questions').get().then(snapshots =>{
       snapshots.forEach(doc=>{
         const id = doc.id;
         const data = doc.data()
         dataset[id] =data
       })
     })
     this.initDataset(dataset)
     const initAnswer=""
    this.selectAnswer(initAnswer,this.state.currentId)
   })();
 }
//選択時、自動でスクロールされる
 componentDidUpdate(prevProops,prevState,snapshot){
   const scrollArea=document.getElementById('scroll-area');
   if(scrollArea){
     scrollArea.scrollTop = scrollArea.scrollHeight
   }
 }
 //

  render() {
    return (
      <section className="c-section">
        <div className="c-box">
          <Chats chats={this.state.chats} />
          <AnswersList answers={this.state.answers} 
          select={this.selectAnswer}
          />
          <FormDialog open={this.state.open} handleClose={this.handleClose} />
        </div>
      </section>
    );
  }
  }

