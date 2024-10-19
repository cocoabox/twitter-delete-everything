(async function() {
    // 
    // This only works if the Twitter UI is in US English language
    // 
    function sleep(timeout) {
        return new Promise(resolve => {
            setTimeout(()=>resolve(), timeout);
        });
    }
    function wait_for_element(selector, {filter_func=null, timeout=1000}={}) {
        return new Promise((resolve, reject) => {
            let interval;
            setTimeout(() => { 
                clearInterval(interval);
                reject({timeout:true}); 
            }, timeout);
            const do_query = () => {
                const queried = document.querySelectorAll(selector);
                if (! queried) return;
                const elems = [...queried];
                const filtered = filter_func ? elems.filter(filter_func) : elems;
                if (filtered) {
                    clearInterval(interval);
                    resolve(filtered);
                    return true;
                }
            };
            if (do_query()) {
                clearInterval(interval);
            }
            else {
                interval = setInterval(do_query, 200);
            }
        });
    }
    async function click_and_wait(elem, {timeout=100}={}) {
        elem.click();
        await sleep(timeout);
    }
    const errs = [];
    //
    // main 
    //
    while (true) {
        await sleep(200);
        if (errs.length > 5) {
            alert('Too many errors, aborting. Please run again.\n\n' + errs.join('\n'));
            break;
        }

        const undo_retweet_buttons = await wait_for_element('article button[data-testid="unretweet"]');
        if (undo_retweet_buttons?.length > 0) {
            await click_and_wait( undo_retweet_buttons[0], {timeout:200} );
            const undo_repost_spans = await wait_for_element('*[data-testid="Dropdown"] span', {filter_func: span => span.innerHTML==='Undo repost'});
            if (undo_repost_spans?.length > 0) { 
                await click_and_wait(undo_repost_spans[0], {timeout:200} );
                continue;
            }
            else {
                errs.push('Could not find the Undo Repost menu item\n\nThe top item of your timeline is neither a Tweet or a Retweet. Please get rid of it and try again');
                break;
            }
        }

        const article_menu_button = document.querySelector('article button[aria-haspopup="menu"]');
        if (! article_menu_button) {
            errs.push('no more article menu button');
            break;
        }
        await click_and_wait(article_menu_button);


        const delete_spans = await wait_for_element('*[data-testid="Dropdown"] span', {filter_func: span => span.innerHTML==='Delete'});
        if (delete_spans?.length > 0) { 
            await click_and_wait(delete_spans[0]);
        }
        else { continue; }

        const delete_buttons = await wait_for_element('*[data-testid="confirmationSheetDialog"] span', {filter_func: span => span.innerHTML==='Delete'});
        if (delete_buttons?.length > 0 ) { 
            await click_and_wait( delete_buttons[0] );
        }
        else { continue; }
    }

})();
