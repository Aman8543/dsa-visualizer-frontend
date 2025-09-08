import HomeNav from "../component/homeNav"
import CardsPage from "../component/cardsPage"
export default function Home({userdata}){
    return (
        <div className=" absolute left-0 top-0 min-w-full">
            <header>
            <nav >
                <HomeNav userdata={userdata} ></HomeNav>
            </nav>
            </header>

            <main>
                <div className=" min-w-screen bg-black min-h-screen justify-center items-center pt-16 ">
                    <CardsPage></CardsPage>
                </div>
            </main>
           
        </div>
    )
}