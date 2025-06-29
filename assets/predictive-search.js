class PredictiveSearch extends SearchForm{constructor(){super();this.cachedResults={};this.predictiveSearchResults=this.querySelector('[data-predictive-search]');this.allPredictiveSearchInstances=document.querySelectorAll('predictive-search');this.isOpen=!1;this.abortController=new AbortController();this.searchTerm='';this.setupEventListeners()}
setupEventListeners(){this.input.form.addEventListener('submit',this.onFormSubmit.bind(this));this.input.addEventListener('focus',this.onFocus.bind(this));this.addEventListener('focusout',this.onFocusOut.bind(this));this.addEventListener('keyup',this.onKeyup.bind(this));this.addEventListener('keydown',this.onKeydown.bind(this))}
getQuery(){return this.input.value.trim()}
onChange(){super.onChange();const newSearchTerm=this.getQuery();if(!this.searchTerm||!newSearchTerm.startsWith(this.searchTerm)){this.querySelector('#predictive-search-results-groups-wrapper')?.remove()}
this.updateSearchForTerm(this.searchTerm,newSearchTerm);this.searchTerm=newSearchTerm;if(!this.searchTerm.length){this.close(!0);return}
this.getSearchResults(this.searchTerm)}
onFormSubmit(event){if(!this.getQuery().length||this.querySelector('[aria-selected="true"] a'))event.preventDefault();}
onFormReset(event){super.onFormReset(event);if(super.shouldResetForm()){this.searchTerm='';this.abortController.abort();this.abortController=new AbortController();this.closeResults(!0)}}
onFocus(){const currentSearchTerm=this.getQuery();if(!currentSearchTerm.length)return;if(this.searchTerm!==currentSearchTerm){this.onChange()}else if(this.getAttribute('results')==='true'){this.open()}else{this.getSearchResults(this.searchTerm)}}
onFocusOut(){setTimeout(()=>{if(!this.contains(document.activeElement))this.close();})}
onKeyup(event){if(!this.getQuery().length)this.close(!0);event.preventDefault();switch(event.code){case 'ArrowUp':this.switchOption('up');break;case 'ArrowDown':this.switchOption('down');break;case 'Enter':this.selectOption();break}}
onKeydown(event){if(event.code==='ArrowUp'||event.code==='ArrowDown'){event.preventDefault()}}
updateSearchForTerm(previousTerm,newTerm){const searchForTextElement=this.querySelector('[data-predictive-search-search-for-text]');const currentButtonText=searchForTextElement?.innerText;if(currentButtonText){if(currentButtonText.match(new RegExp(previousTerm,'g')).length>1){return}
const newButtonText=currentButtonText.replace(previousTerm,newTerm);searchForTextElement.innerText=newButtonText}}
switchOption(direction){if(!this.getAttribute('open'))return;const moveUp=direction==='up';const selectedElement=this.querySelector('[aria-selected="true"]');const allVisibleElements=Array.from(this.querySelectorAll('li, button.predictive-search__item')).filter((element)=>element.offsetParent!==null);let activeElementIndex=0;if(moveUp&&!selectedElement)return;let selectedElementIndex=-1;let i=0;while(selectedElementIndex===-1&&i<=allVisibleElements.length){if(allVisibleElements[i]===selectedElement){selectedElementIndex=i}
i++}
this.statusElement.textContent='';if(!moveUp&&selectedElement){activeElementIndex=selectedElementIndex===allVisibleElements.length-1?0:selectedElementIndex+1}else if(moveUp){activeElementIndex=selectedElementIndex===0?allVisibleElements.length-1:selectedElementIndex-1}
if(activeElementIndex===selectedElementIndex)return;const activeElement=allVisibleElements[activeElementIndex];activeElement.setAttribute('aria-selected',!0);if(selectedElement)selectedElement.setAttribute('aria-selected',!1);this.input.setAttribute('aria-activedescendant',activeElement.id)}
selectOption(){const selectedOption=this.querySelector('[aria-selected="true"] a, button[aria-selected="true"]');if(selectedOption)selectedOption.click();}
getSearchResults(searchTerm){const queryKey=searchTerm.replace(' ','-').toLowerCase();this.setLiveRegionLoadingState();if(this.cachedResults[queryKey]){this.renderSearchResults(this.cachedResults[queryKey]);return}
fetch(`${routes.predictive_search_url}?q=${encodeURIComponent(searchTerm)}&section_id=predictive-search`,{signal:this.abortController.signal,}).then((response)=>{if(!response.ok){var error=new Error(response.status);this.close();throw error}
return response.text()}).then((text)=>{const resultsMarkup=new DOMParser().parseFromString(text,'text/html').querySelector('#shopify-section-predictive-search').innerHTML;this.allPredictiveSearchInstances.forEach((predictiveSearchInstance)=>{predictiveSearchInstance.cachedResults[queryKey]=resultsMarkup});this.renderSearchResults(resultsMarkup)}).catch((error)=>{if(error?.code===20){return}
this.close();throw error})}
setLiveRegionLoadingState(){this.statusElement=this.statusElement||this.querySelector('.predictive-search-status');this.loadingText=this.loadingText||this.getAttribute('data-loading-text');this.setLiveRegionText(this.loadingText);this.setAttribute('loading',!0)}
setLiveRegionText(statusText){this.statusElement.setAttribute('aria-hidden','false');this.statusElement.textContent=statusText;setTimeout(()=>{this.statusElement.setAttribute('aria-hidden','true')},1000)}
renderSearchResults(resultsMarkup){this.predictiveSearchResults.innerHTML=resultsMarkup;this.setAttribute('results',!0);this.setLiveRegionResults();this.open()}
setLiveRegionResults(){this.removeAttribute('loading');this.setLiveRegionText(this.querySelector('[data-predictive-search-live-region-count-value]').textContent)}
getResultsMaxHeight(){this.resultsMaxHeight=window.innerHeight-document.querySelector('.section-header')?.getBoundingClientRect().bottom;return this.resultsMaxHeight}
open(){this.predictiveSearchResults.style.maxHeight=this.resultsMaxHeight||`${this.getResultsMaxHeight()}px`;this.setAttribute('open',!0);this.input.setAttribute('aria-expanded',!0);this.isOpen=!0}
close(clearSearchTerm=!1){this.closeResults(clearSearchTerm);this.isOpen=!1}
closeResults(clearSearchTerm=!1){if(clearSearchTerm){this.input.value='';this.removeAttribute('results')}
const selected=this.querySelector('[aria-selected="true"]');if(selected)selected.setAttribute('aria-selected',!1);this.input.setAttribute('aria-activedescendant','');this.removeAttribute('loading');this.removeAttribute('open');this.input.setAttribute('aria-expanded',!1);this.resultsMaxHeight=!1;this.predictiveSearchResults.removeAttribute('style')}}
customElements.define('predictive-search',PredictiveSearch)