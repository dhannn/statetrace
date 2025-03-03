import React from "react";

export default function ErrorModal({ error }) {
    return (
        <div className='error-modal'>
            <p><pre><strong>[ERROR]</strong></pre> { error } </p>
        </div>
    );
}
