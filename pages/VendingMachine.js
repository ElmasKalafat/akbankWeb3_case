import Head from 'next/head'
import { useState, useEffect } from 'react'
import Web3 from 'web3'
import 'bulma/css/bulma.css'
import styles from "../styles/VendingMachine.module.css"
import vendingMachineContract from '../blockchain/vending'

const VendingMachine = () => {
    const [error,setError] = useState('');
    const [success, setSuccess] = useState('')
    const [inventory, setInventory] = useState('');
    const [myDonutCount,setMyDonutCount] = useState('');
    const [buyCount, setBuyCount] = useState('')
    const [web3, setWeb3] = useState(null)
    const [address,setAddress] = useState(null)
    const [vmContract, setVmContract]= useState(null)

    useEffect( () =>{
        if(vmContract) getInventoryHandler()
        if(vmContract && address)  getMyDonutCountHandler()
    }, [vmContract, address])

    const getInventoryHandler = async () => {
        const inventory = await vmContract.methods.getVendingMachineBalance().call()
        setInventory(inventory)
    }

    const getMyDonutCountHandler = async () => {
        const accounts = await web3.eth.getAccounts();
        const count = await vmContract.methods.donutBalances(address).call()
        setMyDonutCount(count)
    }
    const buyDonutHandler = async () => {
        try{
            await vmContract.methods.purchase(buyCount).send({
                from: address,
                value: web3.utils.toWei('0.001','ether') * buyCount
            })
            setSuccess(` ${buyCount} donuts purchased !!`)
            if(vmContract) getInventoryHandler()
            if(vmContract && address)  getMyDonutCountHandler()
        }
        catch(e){
            setError(e.message)
        }
        
    }
    const updateDonutQty = e => {
        setBuyCount(e.target.value)
    }
    // window ethereum
    const connectWalletHandler = async() =>{
        if(typeof window !== "undefined" && typeof window.ethereum !== "undefined"){
            try{
                 await window.ethereum.request({method:"eth_requestAccounts"})
                 web3 = new Web3(window.ethereum)
                 setWeb3(web3)
                 const accounts = await web3.eth.getAccounts();
                 setAddress(accounts[0])
                 const vm = vendingMachineContract(web3)
                 setVmContract(vm);
                 
            }
            catch(e){
                console.log(e.message);
                setError(e.message);
            }
        }
        else{
            // Metamask not installed
            alert("please install metamask");
        }
    }

    return (
        <div className={styles.main}>
            <Head>
                <title>VendingMachine App</title>
                <meta name="description" content="a blockchain vending machine app" />
            </Head>
            <nav className="navbar mt-4 mb-4">
                <div className='container'>
                    <div className='navbar-brand'>
                        <h1>Vending Machine</h1>
                    </div>
                    <div className='navbar-end'>
                        <button onClick={connectWalletHandler} className='button is-primary'>Connect Wallet</button>
                    </div>
                </div>
            </nav>
            <section>
                <div className='container'>
                    <h2>Vending Machine inventory: {inventory}</h2>
                </div>
            </section>
            <section>
                <div className='container'>
                    <h2>My Donuts: {myDonutCount}</h2>
                </div>
            </section>
            <section className='mt-5'>
                <div className='container'>
                    <div className='field'>
                        <label className='label'>Buy Donuts</label>
                        <div className='control'>
                            <input onChange={updateDonutQty} className='input' type='type' placeholder="Enter Amount..."></input>
                        </div>
                        <button 
                            onClick={buyDonutHandler} 
                            className='button is-primary mt-2'>Buy</button>
                    </div>
                </div>
            </section>
            <section>
                <div className='container has-text-danger'>
                    <p>{error}</p>
                </div>
            </section>
            <section>
                <div className='container has-text-success'>
                    <p>{success}</p>
                </div>
            </section>
        </div>
        
    )
}
export default VendingMachine;