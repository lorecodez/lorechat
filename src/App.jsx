import { useState, useRef } from 'react'
import './App.css'
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import { LuSendHorizonal } from "react-icons/lu";




import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  apiKey: import.meta.env.VITE_API_KEY,

  authDomain: import.meta.env.VITE_AUTH_DOMAIN,

  projectId: import.meta.env.VITE_PROJECT_ID,

  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,

  messagingSenderId: import.meta.env.VITE_MESSAGE_SENDER_ID,

  appId: import.meta.env.VITE_APP_ID,

  measurementId: import.meta.env.VITE_MEASUREMENT_ID,

});

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {

  const [user] = useAuthState(auth);

  return (
    <>
      <div className='bg-gray-50 flex flex-col justify-between items-center w-full h-full min-h-screen px-2'>
        <header className=' sticky z-20 w-full top-0 bg-gray-100 flex gap-2 h-14 items-center justify-between'>
          <div className='flex flex-col'>
            <div className='bg-green-500 rounded-full aspect-square shadow-xl w-fit z-10 relative mb-4'>
              <p className='text-center w-full font-space-mono text-lg p-1 font-semibold'>L</p>
            </div>
            <div className='bg-gray-50 rounded-full aspect-square shadow-xl w-[36px] z-20 absolute mt-4 ml-5'>
              <p className='text-center w-full font-space-mono text-lg text-gray-700 p-1 font-semibold'>C</p>
            </div>
          </div>
          <div className=''>
            {user && <SignOut/>}
          </div>
        </header>
        <section className=' relative z-10 w-full max-w-4xl'>
          {user ? <ChatRoom/> : <SignIn/>}
        </section>
        <footer className='flex flex-col gap-1 w-full text-center bottom-0 relative'>
          <span className='w-full'> 
            © 2023 All rights reserved 
          </span>
          <a 
          href='https://lorenzowashington.com' 
          className='hover:underline w-full'
          >
            Site Developed and Designed by <span className='font-mono'>LORENZO WASHINGTON</span>
          </a>
        </footer>
      </div>
    </>
  )
}


function SignIn() {

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <div className='h-full w-full flex items-center justify-center flex-col gap-5'>
      <div className='flex flex-col mb-12'>
        <div className='bg-green-500 rounded-full aspect-square shadow-xl w-fit z-20 absolute mb-16 mr-36 flex justify-center items-center'>
          <p className='text-center w-full font-space-mono text-7xl'>Lore</p>
        </div>
        <div className='bg-gray-50 rounded-full aspect-square shadow-xl w-fit z-20 relative ml-36 mt-16 flex justify-center items-center'>
          <p className='text-center w-full font-space-mono text-7xl text-gray-700'>Chat</p>
        </div>
      </div>
      <button
      title='sign in button'
      type='button'
      onClick={signInWithGoogle}
      className=' text-xl p-2 px-5 shadow-2xl rounded-full text-center bg-gray-700 text-gray-50 font-space-grotesk hover:bg-transparent hover:text-gray-700 transition ease-linear active:scale-90 active:shadow-none'
      >
        Sign in with Google
      </button>
    </div>
  )
}

function SignOut(){
  return auth.currentUser && (
    <div className='h-fit'>
      <button
      title='Sign out button'
      type='button'
      onClick={() => auth.signOut()}
      className='rounded-md px-2 py-1 shadow-lg hover:bg-green-500 hover:text-gray-50 font-semibold bg-gray-300 transition ease-in font-space-grotesk active:scale-90 active:shadow-none'
      >
        Sign Out
      </button>
    </div>
  )
}

function ChatRoom(){

  const messagAnchor = useRef();

  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);

  const [ messages ] = useCollectionData(query, {idField: 'id'});
  const [formValue, setFormValue] = useState('');

  const sendMessage = async(e) => {

    e.preventDefault();

    if(formValue == ''){
      alert('please type a message');
      return
    }

    const {uid, photoURL} = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
    });

    setFormValue('');

    messagAnchor.current.scrollIntoView({behavior:'smooth'});

  };


  return (
    <div className='h-full max-h-screen w-full flex flex-col justify-center items-center gap-y-4'>
      <h1 className='text-2xl drop-shadow-lg font-space-mono'>
        Chat Room
      </h1>
      <div className='h-96 overflow-y-scroll w-full flex flex-col justify-center items-center gap-y-4 roounded-md shadow-lg p-2'>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg}/>)}
        <div ref={messagAnchor}></div>
      </div>
      <form className='w-full'>
        <input
        title='message'
        type='text'
        placeholder='Message...'
        value={formValue}
        onChange={(e) => setFormValue(e.target.value)}
        className='w-full relative z-10 h-12 rounded-md p-1 shadow-lg'
        />
       <div className='absolute z-20 bottom-0 right-0 h-12 flex justify-center items-center'>
        <button
          title='submit'
          type='submit'
          onClick={sendMessage}
          className='bg-green-500 text-black  rounded-full p-2 mr-1 shadow-inner transition-all duration-300 ease-in-out w-fit group flex justify-center items-center flex-nowrap active:scale-50'
          >
            <p className=' w-0 h-0 p-0 text-base m-0 group-hover:scale-100 group-hover:w-full group-hover:h-fit group-hover:pr-1 leading-none transition-all duration-300 ease-in-out overflow-hidden font-space-grotesk'>
              Send
            </p>
            <LuSendHorizonal 
            color='black'
            className='drop-shadow-lg transform-none min-w-max'
            />
          </button>
       </div>
      </form>
    </div>
  )
}

function ChatMessage({message}) {

  const {text, uuid, photoURL} = message;
  const messageClass = uuid == auth.currentUser.uid ? 'justify-end' :  'justify-start';

return (
    <div className={`w-full flex items-center  ${messageClass} `}>
        <div className=' bg-gray-200 p-2 flex items-center gap-2 rounded-md min-w-[100px]'>
          <img
          title={`${auth.currentUser.displayName}`}
          alt={`${auth.currentUser.displayName}&apos; photo`}
          src={photoURL}
          className='rounded-full aspect-square h-16'
          />
          <div>
            <h2 className='text-md font-semibold font-space-grotesk'>
              {auth.currentUser.displayName}
            </h2>
            <p 
            title='message' 
            className='text-md text-gray-700'
            >
              {text}
            </p>
          </div>
        </div>
    </div>
  )
}

ChatMessage.propTypes = {
  message: {}
}

export default App
