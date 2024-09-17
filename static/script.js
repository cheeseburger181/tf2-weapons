/* --- api --- */
const data = {
    steamId: '76561198854329471',
    refresh: false
};

const storage = [];

/* --- main items data structure --- */
let structure = [];

/* --- current item filters --- */
const filters = {
    filter_slot: ["primary", "secondary", "melee", "pda2", "building"],
    filter_quality: ["Unique", "vintage", "rarity1", "strange", "rarity4", "haunted", "collectors", "paintkitweapon"],
    filter_class: ["Scout", "Soldier", "Pyro", "Demoman", "Heavy", "Engineer", "Medic", "Sniper", "Spy"],
    filter_tradability: ["tradable", "untrade"],
    filter_craftability: ["craftable", "uncraft"],
    filter_killstreak: ["none", "killstreak", "specialized", "professional"]
};

/* --- specifically filtered items counter --- */
const counter = {
    counter_primary: 0,
    counter_secondary: 0,
    counter_melee: 0,
    counter_pda2: 0,
    counter_building: 0,
    counter_unique: 0,
    counter_vintage: 0,
    counter_genuine: 0,
    counter_strange: 0,
    counter_unusual: 0,
    counter_haunted: 0,
    counter_collectors: 0,
    counter_decorated: 0,
    counter_scout: 0,
    counter_soldier: 0,
    counter_pyro: 0,
    counter_demoman: 0,
    counter_heavy: 0,
    counter_engineer: 0,
    counter_medic: 0,
    counter_sniper: 0,
    counter_spy: 0,
    counter_tradable: 0,
    counter_untradable: 0,
    counter_craftable: 0,
    counter_uncraftable: 0,
    counter_none: 0,
    counter_killstreak: 0,
    counter_specialized: 0,
    counter_professional: 0
};

/* --- filters lists appearance --- */
function appear(num) {
    let children = document.getElementsByClassName("mainside_content_filters_buttons_list")[num].getElementsByTagName("li");
    for (let child of children)
        child.setAttribute('style', 'display: block')
}

/* --- filters lists disappearance --- */
function disappear(num) {
    let children = document.getElementsByClassName("mainside_content_filters_buttons_list")[num].getElementsByTagName("li");
    for (let child of children)
        child.setAttribute('style', 'display: none')
}

async function fetch_storage() {
    const url = 'http://localhost:8080/list';
    const options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json', 
        },
    };

    let resp;

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        resp = await response.json();
        
    } catch (error) {
        console.error('There was a problem with the request:', error);
    }

    for (let id of resp) {
        storage.push(id.replace(/\D/g, ''));
        document.getElementsByClassName("mainside_functions_datalist")[0].innerHTML += "<li class='mainside_functions_datalist_items'>" + id.replace(/\D/g, '') + "</li>";
    }

    for (let i = 0; i < resp.length; i++) {
        let li = document.getElementsByClassName("mainside_functions_datalist_items")[i];
        li.addEventListener('click', function() {
            document.getElementsByClassName("mainside_functions_input")[0].value = li.textContent;
        })
    }
        
}

async function fetch_steamapi() {
    const url = 'http://localhost:8080/items';
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json', 
        },
        body: JSON.stringify(data) 
    };

    let resp;

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        resp = await response.json();
        if (resp.error == '429') {
            data.refresh = false;
            error(5);
            fetch_steamapi();
        }
        if (resp.error == '404') {
            error(1);
            return;
        }
        if (resp.error == '403') {
            error(3);
            return;
        }
        console.log(resp.error);
    } catch (TypeError) {
        error(4);
    }

    data.refresh = false;
    get_items(resp);
}

/* --- main data structure filling --- */
function get_items(jsonData) {
    if (jsonData.total_inventory_count == 0) {
        error(2);
        return;
    };
    if (jsonData.assets == null) {
        return;
    };
    const slots = ['primary', 'secondary', 'melee', 'pda2', 'building'];
    let num = 0;

    for (let k = 0; k < jsonData.descriptions.length; k++) {
        if (!slots.includes(jsonData.descriptions[k].tags[1].internal_name))
            continue;

        let classes = [];
        let class_num = 0;
        for (let i = 0; i < jsonData.descriptions[k].tags.length; i++) {
            if (jsonData.descriptions[k].tags[i].category == "Class") {
                classes.push(jsonData.descriptions[k].tags[i].localized_tag_name);
                class_num++;
            }
        };
        if (class_num == 0) continue;

        let tradability = "tradable";
        if (jsonData.descriptions[k].tradable == 0)
            tradability = "untrade";

        let craftability = "craftable";
        if (jsonData.descriptions[k].hasOwnProperty("descriptions")) {
            for (let i = 0; i < jsonData.descriptions[k].descriptions.length; i++) {
                if (jsonData.descriptions[k].descriptions[i].value.includes("перековывать"))
                    craftability = "uncraft";
            };
        }

        let killstreak = "none";
        if (jsonData.descriptions[k].market_hash_name.includes("Professional"))
            killstreak = "professional";
        else if (jsonData.descriptions[k].market_hash_name.includes("Specialized"))
            killstreak = "specialized";
        else if (jsonData.descriptions[k].market_hash_name.includes("Killstreak"))
            killstreak = "killstreak";
        
        structure.push({
            item_id: "id" + num,
            item_name: jsonData.descriptions[k].market_hash_name,
            item_slot: jsonData.descriptions[k].tags[1].internal_name,
            item_quality: jsonData.descriptions[k].tags[0].internal_name,
            item_class: classes,
            item_tradability: tradability,
            item_craftability: craftability,
            item_killstreak: killstreak,
            item_image: jsonData.descriptions[k].icon_url_large
        });

        //console.log(structure[num]);
        num++;
    };

    if (num == 0) error(2);

    stat_counter();
    create_items();
}

/* --- counting statistics --- */
function stat_counter() {
    if (structure.length != 0) {
        for (let item of structure) {
            switch(item.item_slot) {
                case 'primary': counter.counter_primary++; break;
                case 'secondary': counter.counter_secondary++; break;
                case 'melee': counter.counter_melee++; break;
                case 'pda2': counter.counter_pda2++; break;
                case 'building': counter.counter_building++; break
            };
    
            switch(item.item_quality) {
                case 'Unique': counter.counter_unique++; break;
                case 'vintage': counter.counter_vintage++; break;
                case 'rarity1': counter.counter_genuine++; break;
                case 'strange': counter.counter_strange++; break;
                case 'rarity4': counter.counter_unusual++; break;
                case 'haunted': counter.counter_haunted++; break;
                case 'collectors': counter.counter_collectors++; break;
                case 'paintkitweapon': counter.counter_decorated++; break;
            };
    
            for (let class1 of item.item_class) {
                switch(class1) {
                    case 'Scout': counter.counter_scout++; break;
                    case 'Soldier': counter.counter_soldier++; break;
                    case 'Pyro': counter.counter_pyro++; break;
                    case 'Demoman': counter.counter_demoman++; break;
                    case 'Heavy': counter.counter_heavy++; break;
                    case 'Engineer': counter.counter_engineer++; break;
                    case 'Medic': counter.counter_medic++; break;
                    case 'Sniper': counter.counter_sniper++; break;
                    case 'Spy': counter.counter_spy++; break;
                };
            }
    
            switch(item.item_tradability) {
                case 'tradable': counter.counter_tradable++; break;
                case 'untrade': counter.counter_untradable++; break;
            };
    
            switch(item.item_craftability) {
                case 'craftable': counter.counter_craftable++; break;
                case 'uncraft': counter.counter_uncraftable++; break;
            };
    
            switch(item.item_killstreak) {
                case 'none': counter.counter_none++; break;
                case 'killstreak': counter.counter_killstreak++; break;
                case 'specialized': counter.counter_specialized++; break;
                case 'professional': counter.counter_professional++; break;
            };
        };
    } else {
        counter.counter_primary = 0,
        counter.counter_secondary = 0,
        counter.counter_melee = 0,
        counter.counter_pda2 = 0,
        counter.counter_building = 0,
        counter.counter_unique = 0,
        counter.counter_vintage = 0,
        counter.counter_genuine = 0,
        counter.counter_strange = 0,
        counter.counter_unusual = 0,
        counter.counter_haunted = 0,
        counter.counter_collectors = 0,
        counter.counter_decorated = 0,
        counter.counter_scout = 0,
        counter.counter_soldier = 0,
        counter.counter_pyro = 0,
        counter.counter_demoman = 0,
        counter.counter_heavy = 0,
        counter.counter_engineer = 0,
        counter.counter_medic = 0,
        counter.counter_sniper = 0,
        counter.counter_spy = 0,
        counter.counter_tradable = 0,
        counter.counter_untradable = 0,
        counter.counter_craftable = 0,
        counter.counter_uncraftable = 0,
        counter.counter_none = 0,
        counter.counter_killstreak = 0,
        counter.counter_specialized = 0,
        counter.counter_professional = 0
    };

    add_stats();
}

/* --- displaying statistics --- */
function add_stats() {
    let array = Object.entries(counter);
    for (let i = 0; i < document.getElementsByClassName('mainside_content_filters_buttons_list_item_count').length; i++) {
        document.getElementsByClassName('mainside_content_filters_buttons_list_item_count')[i].innerHTML = array[i][1];
    }
}

/* --- first items' displaying --- */
function create_items() {
    for (let item of structure) {
        let square = document.createElement('div');
        square.setAttribute('id', item.item_id);
        square.classList.add("mainside_content_items_area_square");
        document.getElementsByClassName("mainside_content_items_area")[0].appendChild(square);
        let img = document.createElement('img');
        img.classList.add("mainside_content_items_area_square_image");
        img.src = 'https://steamcommunity-a.akamaihd.net/economy/image/' + item.item_image;
        square.appendChild(img);

        let description = document.getElementById('description').cloneNode(true);
        description.id = item.item_id + "_description";
        document.getElementsByClassName("descriptions")[0].appendChild(description);

        description.getElementsByClassName("descriptions_description_name")[0].getElementsByTagName('span')[0].innerHTML = item.item_name;
        description.getElementsByClassName("descriptions_description_slot")[0].getElementsByTagName('span')[1].innerHTML = item.item_slot;
        
        for (let class1 of item.item_class) {
            switch(class1) {
                case 'Scout':
                    description.getElementsByClassName("descriptions_description_class_images")[0].innerHTML += '<img src="img/class_scout.png">';
                    break;
                case 'Soldier':
                    description.getElementsByClassName("descriptions_description_class_images")[0].innerHTML += '<img src="img/class_soldier.png">';
                    break;
                case 'Pyro':
                    description.getElementsByClassName("descriptions_description_class_images")[0].innerHTML += '<img src="img/class_pyro.png">';
                    break;
                case 'Demoman':
                    description.getElementsByClassName("descriptions_description_class_images")[0].innerHTML += '<img src="img/class_demoman.png">';
                    break;
                case 'Heavy':
                    description.getElementsByClassName("descriptions_description_class_images")[0].innerHTML += '<img src="img/class_heavy.png">';
                    break;
                case 'Engineer':
                    description.getElementsByClassName("descriptions_description_class_images")[0].innerHTML += '<img src="img/class_engineer.png">';
                    break;
                case 'Medic':
                    description.getElementsByClassName("descriptions_description_class_images")[0].innerHTML += '<img src="img/class_medic.png">';
                    break;
                case 'Sniper':
                    description.getElementsByClassName("descriptions_description_class_images")[0].innerHTML += '<img src="img/class_sniper.png">';
                    break;
                case 'Spy':
                    description.getElementsByClassName("descriptions_description_class_images")[0].innerHTML += '<img src="img/class_spy.png">';
                    break;            
            }
        }

        switch(item.item_quality) {
            case 'Unique':
                square.classList.add("unique");
                description.getElementsByClassName("descriptions_description_name")[0].classList.add("unique");
                break;
            case 'vintage':
                square.classList.add("vintage");
                description.getElementsByClassName("descriptions_description_name")[0].classList.add("vintage");
                break;
            case 'rarity1':
                square.classList.add("genuine");
                description.getElementsByClassName("descriptions_description_name")[0].classList.add("genuine");
                break;
            case 'strange':
                square.classList.add("strange");
                description.getElementsByClassName("descriptions_description_name")[0].classList.add("strange");
                break;
            case 'rarity4':
                square.classList.add("unusual");
                description.getElementsByClassName("descriptions_description_name")[0].classList.add("unusual");
                break;
            case 'haunted':
                square.classList.add("haunted");
                description.getElementsByClassName("descriptions_description_name")[0].classList.add("haunted");
                break;
            case 'collectors':
                square.classList.add("collectors");
                description.getElementsByClassName("descriptions_description_name")[0].classList.add("collectors");
                break;
            case 'paintkitweapon':
                square.classList.add("decorated");
                description.getElementsByClassName("descriptions_description_name")[0].classList.add("decorated");
                break;
        }
            
        if (item.item_tradability == "untrade") {
            square.classList.add("untradable");
            description.getElementsByClassName("descriptions_description_tradable")[0].style.display = 'block';
        } 

        if (item.item_craftability == "uncraft") {
            square.classList.add("uncraftable");
            description.getElementsByClassName("descriptions_description_craftable")[0].style.display = 'block';
        }
            
        if (item.item_killstreak == "killstreak") {
            square.classList.add("killstreak");
            description.getElementsByClassName("descriptions_description_killstreak")[0].style.display = 'flex';
            description.getElementsByClassName("descriptions_description_killstreak")[0].getElementsByTagName('span')[0].innerHTML = "Killstreak:";
        }
            
        if (item.item_killstreak == "specialized") {
            square.classList.add("specialized");
            description.getElementsByClassName("descriptions_description_killstreak")[0].style.display = 'flex';
            description.getElementsByClassName("descriptions_description_killstreak")[0].getElementsByTagName('span')[0].innerHTML = "Specialized killstreak:";
        }

        if (item.item_killstreak == "professional") {
            square.classList.add("professional");
            description.getElementsByClassName("descriptions_description_killstreak")[0].style.display = 'flex';
            description.getElementsByClassName("descriptions_description_killstreak")[0].getElementsByTagName('span')[0].innerHTML = "Professional killstreak:";
        }
           
        square.addEventListener("mouseenter", function(e) {
            description.style.display = 'block';
        });
        square.addEventListener("mouseleave", function(e) {
            description.style.display = 'none';
        });
        square.addEventListener("mousemove", function(e) {
            cursor_position(e, description);
        });
    };

    display_items();
}

/* --- following cursor --- */
function cursor_position(e, div) {
    div.style.left = e.pageX - (div.offsetWidth) / 2 + "px";
    div.style.top = e.pageY + 25 + "px";
};

/* --- additional items' displaying --- */
function display_items() {
    let num = 0;

    for (let item of structure) {
        document.getElementById(item.item_id).setAttribute('style', 'display: none');
        
        if (!item.item_name.toLowerCase().includes(document.getElementsByTagName('input')[0].value))
            continue;
        
        if (!filters.filter_slot.some(str => str.includes(item.item_slot)))
            continue;
        
        if (!filters.filter_quality.some(str => str.includes(item.item_quality)))
            continue;
        
        let class_check = false;
        for (let class1 of item.item_class) {
            if (filters.filter_class.some(str => str.includes(class1))) {
                class_check = true;
                break;
            }    
        };
        if (!class_check) continue;
        
        if (!filters.filter_tradability.some(str => str.includes(item.item_tradability)))
            continue;
        
        if (!filters.filter_craftability.some(str => str.includes(item.item_craftability)))
            continue;

        if (!filters.filter_killstreak.some(str => str.includes(item.item_killstreak)))
            continue;

        num++;
        document.getElementById(item.item_id).setAttribute('style', 'display: flex');
    };

    total_count(num);
}

/* --- counting currently displayed / total amount of items --- */
function total_count(current) {
    document.getElementsByClassName('mainside_content_count')[0].getElementsByTagName('span')[0].innerHTML = current;
    document.getElementsByClassName('mainside_content_count')[0].getElementsByTagName('span')[2].innerHTML = structure.length;
}

/* --- checkbox selecting/unselecting --- */
function check_box(target, filter, value) {
    switch(filter) {
        case 'slot':
            if (filters.filter_slot.some(str => str.includes(value))) {
                filters.filter_slot = filters.filter_slot.filter(function(e) { return e !== value });
                target.childNodes[1].setAttribute('src', 'img/check_0.png');
            } else {
                filters.filter_slot.push(value);
                target.childNodes[1].setAttribute('src', 'img/check_1.png');
            }
            break;
        case 'quality':
            if (filters.filter_quality.some(str => str.includes(value))) {
                filters.filter_quality = filters.filter_quality.filter(function(e) { return e !== value });
                target.childNodes[1].setAttribute('src', 'img/check_0.png');
            } else {
                filters.filter_quality.push(value);
                target.childNodes[1].setAttribute('src', 'img/check_1.png');
            }
            break;
        case 'class':
            if (filters.filter_class.some(str => str.includes(value))) {
                filters.filter_class = filters.filter_class.filter(function(e) { return e !== value });
                target.childNodes[1].setAttribute('src', 'img/check_0.png');
            } else {
                filters.filter_class.push(value);
                target.childNodes[1].setAttribute('src', 'img/check_1.png');
            }
            break;
        case 'tradability':
            if (filters.filter_tradability.some(str => str.includes(value))) {
                filters.filter_tradability = filters.filter_tradability.filter(function(e) { return e !== value });
                target.childNodes[1].setAttribute('src', 'img/check_0.png');
            } else {
                filters.filter_tradability.push(value);
                target.childNodes[1].setAttribute('src', 'img/check_1.png');
            }
            break;
        case 'craftability':
            if (filters.filter_craftability.some(str => str.includes(value))) {
                filters.filter_craftability = filters.filter_craftability.filter(function(e) { return e !== value });
                target.childNodes[1].setAttribute('src', 'img/check_0.png');
            } else {
                filters.filter_craftability.push(value);
                target.childNodes[1].setAttribute('src', 'img/check_1.png');
            }
            break;    
        case 'killstreak':
            if (filters.filter_killstreak.some(str => str.includes(value))) {
                filters.filter_killstreak = filters.filter_killstreak.filter(function(e) { return e !== value });
                target.childNodes[1].setAttribute('src', 'img/check_0.png');
            } else {
                filters.filter_killstreak.push(value);
                target.childNodes[1].setAttribute('src', 'img/check_1.png');
            }
            break;
    };

    display_items();
}

/* --- selecting all filters --- */
function select_all() {
    filters.filter_slot = ["primary", "secondary", "melee", "pda2", "building"],
    filters.filter_quality = ["Unique", "vintage", "rarity1", "strange", "rarity4", "haunted", "collectors", "paintkitweapon"],
    filters.filter_class = ["Scout", "Soldier", "Pyro", "Demoman", "Heavy", "Engineer", "Medic", "Sniper", "Spy"],
    filters.filter_tradability = ["tradable", "untrade"],
    filters.filter_craftability = ["craftable", "uncraft"],
    filters.filter_killstreak = ["none", "killstreak", "specialized", "professional"]

    for (let check of document.getElementsByClassName('mainside_content_filters_buttons_list_item'))
        check.childNodes[1].setAttribute('src', 'img/check_1.png');

    display_items();
}

/* --- unselecting all filters --- */
function unselect_all() {
    filters.filter_slot = [],
    filters.filter_quality = [],
    filters.filter_class = [],
    filters.filter_tradability = [],
    filters.filter_craftability = [],
    filters.filter_killstreak = []

    for (let check of document.getElementsByClassName('mainside_content_filters_buttons_list_item'))
        check.childNodes[1].setAttribute('src', 'img/check_0.png');
    
    display_items();
}

function datalist_appear() {
    document.getElementsByClassName("mainside_functions_datalist")[0].style.display = 'block';
}

function datalist_disappear(e) {
    let ul = document.getElementsByClassName("mainside_functions_datalist")[0].getBoundingClientRect();
    let input = document.getElementsByClassName("mainside_functions_input")[0].getBoundingClientRect();
    if (!(ul.right >= e.pageX && ul.left <= e.pageX && input.bottom >= e.pageY && ul.top <= e.pageY))
        document.getElementsByClassName("mainside_functions_datalist")[0].style.display = 'none';
}

function datalist_select(target) {
    let match = document.getElementsByClassName("mainside_functions_datalist_items").length;
    for (let li of document.getElementsByClassName("mainside_functions_datalist_items")) {
        if (!li.textContent.includes(target.value)) {
            li.style.display = 'none';
            match--;
        }
        else
            li.style.display = 'flex';
    }
    document.getElementsByClassName("mainside_functions_datalist")[0].style.display = 'block';
    if (match == 0) document.getElementsByClassName("mainside_functions_datalist")[0].style.display = 'none';
}

/* --- deleting all elements --- */
function delete_all() {
    structure = [];
    select_all();
    stat_counter();
    let length = document.getElementsByClassName('mainside_content_items_area_square').length;
    for (let i = 0; i < length; i++) {
        document.getElementById('id' + i).remove();
        document.getElementById('id' + i + '_description').remove();
    }
}

/* --- 'update file' button --- */
function refresh() {
    error(0);
    delete_all();
    data.steamId = document.getElementsByClassName('mainside_functions_input')[0].value;
    console.log(document.getElementsByClassName('mainside_functions_input')[0].value);
    data.refresh = true;
    fetch_steamapi();
}




function error(num) {
    switch(num) {
        case 0: 
            document.getElementsByClassName("mainside_content_errors")[0].style.display = 'none';
            document.getElementsByClassName("mainside_content_errors_error_1")[0].style.display = 'none';
            document.getElementsByClassName("mainside_content_errors_error_2")[0].style.display = 'none';
            document.getElementsByClassName("mainside_content_errors_error_3")[0].style.display = 'none';
            document.getElementsByClassName("mainside_content_errors_error_4")[0].style.display = 'none';
            document.getElementsByClassName("mainside_content_errors_error_5")[0].style.display = 'none';
            break;
        case 1:
            document.getElementsByClassName("mainside_content_errors")[0].style.display = 'block';
            document.getElementsByClassName("mainside_content_errors_error_1")[0].style.display = 'flex';
            document.getElementsByClassName("mainside_content_errors_error_2")[0].style.display = 'none';
            document.getElementsByClassName("mainside_content_errors_error_3")[0].style.display = 'none';
            document.getElementsByClassName("mainside_content_errors_error_4")[0].style.display = 'none';
            document.getElementsByClassName("mainside_content_errors_error_5")[0].style.display = 'none';
            break;
        case 2:
            document.getElementsByClassName("mainside_content_errors")[0].style.display = 'block';
            document.getElementsByClassName("mainside_content_errors_error_1")[0].style.display = 'none';
            document.getElementsByClassName("mainside_content_errors_error_2")[0].style.display = 'flex';
            document.getElementsByClassName("mainside_content_errors_error_3")[0].style.display = 'none';
            document.getElementsByClassName("mainside_content_errors_error_4")[0].style.display = 'none';
            document.getElementsByClassName("mainside_content_errors_error_5")[0].style.display = 'none';
            break;
        case 3:
            document.getElementsByClassName("mainside_content_errors")[0].style.display = 'block';
            document.getElementsByClassName("mainside_content_errors_error_1")[0].style.display = 'none';
            document.getElementsByClassName("mainside_content_errors_error_2")[0].style.display = 'none';
            document.getElementsByClassName("mainside_content_errors_error_3")[0].style.display = 'flex';
            document.getElementsByClassName("mainside_content_errors_error_4")[0].style.display = 'none';
            document.getElementsByClassName("mainside_content_errors_error_5")[0].style.display = 'none';
            break;
        case 4:
            document.getElementsByClassName("mainside_content_errors")[0].style.display = 'block';
            document.getElementsByClassName("mainside_content_errors_error_1")[0].style.display = 'none';
            document.getElementsByClassName("mainside_content_errors_error_2")[0].style.display = 'none';
            document.getElementsByClassName("mainside_content_errors_error_3")[0].style.display = 'none';
            document.getElementsByClassName("mainside_content_errors_error_4")[0].style.display = 'flex';
            document.getElementsByClassName("mainside_content_errors_error_5")[0].style.display = 'none';
            break;
        case 5:
            document.getElementsByClassName("mainside_content_errors")[0].style.display = 'block';
            document.getElementsByClassName("mainside_content_errors_error_1")[0].style.display = 'none';
            document.getElementsByClassName("mainside_content_errors_error_2")[0].style.display = 'none';
            document.getElementsByClassName("mainside_content_errors_error_3")[0].style.display = 'none';
            document.getElementsByClassName("mainside_content_errors_error_4")[0].style.display = 'none';
            document.getElementsByClassName("mainside_content_errors_error_5")[0].style.display = 'flex';
            break;
    }
}