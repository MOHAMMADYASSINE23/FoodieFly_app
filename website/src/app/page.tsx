"use client";

import { useMemo, useState } from "react";

type Meal = { name: string; category: string; description: string; price: number; rating: number; emoji: string };
const meals: Meal[] = [
  { name: "Classic Cheeseburger", category: "Burgers", description: "Beef, cheddar, lettuce & tomato", price: 12.99, rating: 4.8, emoji: "🍔" },
  { name: "Garden Pizza", category: "Pizza", description: "Mozzarella, tomato & fresh basil", price: 14.5, rating: 4.7, emoji: "🍕" },
  { name: "Chicken Burrito Bowl", category: "Bowls", description: "Spiced chicken, rice & salsa", price: 11.99, rating: 4.9, emoji: "🌯" },
  { name: "Fresh Summer Bowl", category: "Bowls", description: "Greens, avocado & roasted veg", price: 10.5, rating: 4.6, emoji: "🥗" },
  { name: "Double Bacon Burger", category: "Burgers", description: "Two patties, bacon & cheddar", price: 15.99, rating: 4.9, emoji: "🍔" },
  { name: "Crispy Fries", category: "Sides", description: "Golden, lightly salted fries", price: 4.5, rating: 4.7, emoji: "🍟" },
];

export default function Home() {
  const [category, setCategory] = useState("All");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const visibleMeals = useMemo(() => category === "All" ? meals : meals.filter((meal) => meal.category === category), [category]);
  const count = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  const total = meals.reduce((sum, meal) => sum + meal.price * (cart[meal.name] || 0), 0);
  const add = (name: string) => setCart((current) => ({ ...current, [name]: (current[name] || 0) + 1 }));
  const remove = (name: string) => setCart((current) => { const next = { ...current }; delete next[name]; return next; });

  return <main>
    <header className="header"><a href="#top" className="brand"><i>F</i>oodieFly</a><nav><a href="#menu">Menu</a><a href="#how">How it works</a><a href="#about">About</a></nav><div className="headerActions"><a className="loginLink" href="/auth">Sign in</a><button className="cartButton" onClick={() => setCartOpen(true)}>Cart <span>{count}</span></button></div></header>
    <section className="hero" id="top"><div className="heroCopy"><p className="eyebrow">DELIVERING ACROSS LEBANON</p><h1>Good food,<br/><em>right to your door.</em></h1><p className="intro">Your favorite local meals, freshly prepared and delivered when you want them.</p><a className="primary" href="#menu">Explore the menu <b>→</b></a><p className="rating"><strong>4.9/5</strong> <span>★★★★★</span> <small>from happy food lovers</small></p></div><div className="heroArt"><div className="circle"/><div className="burger">🍔</div><div className="delivery"><b>Fast delivery</b><small>at your doorstep</small></div></div></section>
    <section className="filters">{["All", "Burgers", "Pizza", "Bowls", "Sides"].map((item) => <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}</section>
    <section className="menu" id="menu"><div className="sectionTitle"><div><p className="eyebrow">FRESH PICKS</p><h2>Popular near you</h2></div><button onClick={() => setCategory("All")}>View all meals →</button></div><div className="grid">{visibleMeals.map((meal) => <article className="card" key={meal.name}><span className="score">★ {meal.rating}</span><div className="mealImage">{meal.emoji}</div><h3>{meal.name}</h3><p>{meal.description}</p><div className="cardBottom"><b>${meal.price.toFixed(2)}</b><button aria-label={`Add ${meal.name}`} onClick={() => add(meal.name)}>+</button></div></article>)}</div></section>
    <section className="how" id="how"><div><p className="eyebrow">SIMPLE &amp; DELICIOUS</p><h2>From craving to comfort.</h2></div><ol><li><span>01</span><b>Choose your meal</b><p>Browse a menu made for every appetite.</p></li><li><span>02</span><b>We make it fresh</b><p>Your order is prepared with care, just for you.</p></li><li><span>03</span><b>Enjoy at home</b><p>Track your delivery and dig in while it is hot.</p></li></ol></section>
    <footer id="about"><a href="#top" className="brand"><i>F</i>oodieFly</a><p>Made for hungry people in Lebanon.</p><small>© 2026 FoodieFly</small></footer>
    {cartOpen && <><div className="overlay" onClick={() => setCartOpen(false)}/><aside className="cartPanel"><div className="cartHead"><h2>Your order</h2><button onClick={() => setCartOpen(false)}>×</button></div>{count ? <div>{meals.filter((meal) => cart[meal.name]).map((meal) => <div className="cartLine" key={meal.name}><span><b>{meal.name} × {cart[meal.name]}</b><small>${meal.price.toFixed(2)} each</small></span><button onClick={() => remove(meal.name)}>Remove</button></div>)}</div> : <p className="empty">Your cart is empty. Time to fix that.</p>}<div className="total"><span>Total</span><strong>${total.toFixed(2)}</strong></div><button className="primary checkout" onClick={() => { setCart({}); setCartOpen(false); }}>Checkout</button></aside></>}
  </main>;
}