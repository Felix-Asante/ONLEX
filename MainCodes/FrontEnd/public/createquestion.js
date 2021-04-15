const optionContainer = document.getElementById("options");
    const numberOfOptions = document.getElementById("numoptions")

    numberOfOptions.addEventListener("blur", function(){

        if(optionContainer.hasChildNodes()){
            optionContainer.innerHTML=''
        }
        for(let i=0;i<numberOfOptions.value;i++){
            const div = document.createElement("div")
            const inputSelectDiv = document.createElement("div")
            inputSelectDiv.classList.add('input-verdict')
            div.classList.add('response-options')
            const label = document.createElement("label")
            label.innerHTML=`option${i+1}`
            const input = document.createElement("input")
            const select = document.createElement("select")

            select.name=`option${i+1}`
            select.classList.add("verdict")

            const selectOption1 = document.createElement("option")
            const selectOption2 = document.createElement("option")

            selectOption1.value="True"
            selectOption1.innerHTML="True"

            selectOption2.value="False"
            selectOption2.innerHTML='False'

            select.appendChild(selectOption2)
            select.appendChild(selectOption1)

            input.type='text';
            input.placeholder=`option ${i+1}`;
            input.name=`option${i+1}`
            input.required="true"
            div.appendChild(label)
           inputSelectDiv.appendChild(input)
           inputSelectDiv.appendChild(select)
            div.appendChild(inputSelectDiv);
            optionContainer.appendChild(div);


        }
    })

   