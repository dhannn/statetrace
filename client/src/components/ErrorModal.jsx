import React from "react";

export default function ErrorModal({ error }) {
    return (
        <div className='error-modal'>
            <p><b>Error:</b> { error } </p>
        </div>
    );
}
