import React from "react";

export default function Modal({ msg }) {
    return (
        <div className='error-modal'>
            <p> { msg } </p>
        </div>
    );
}
