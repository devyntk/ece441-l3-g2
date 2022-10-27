import React from "react";
import "./style.css";

const Input_field = () => {
  return (
    <form className = 'input'>
            <input type = 'input' placeholder = 'search' className = "input_box"></input>
            <button className ='input_submit' type = 'submit'>Go</button>
      
    </form>
  ); 
};

export default Input_field
