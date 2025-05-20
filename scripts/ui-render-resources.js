// ui-render-resources.js
import { resourcesData } from './program-data.js'; // To get the resource links

export function renderResourcesPage(mainContentEl) {
    let resourcesHtml = `<section class="resources-page"><h2>Helpful Resources</h2>`;

    // Helper function to generate HTML for a list of resources in a category
    const createResourceListHtml = (title, resourcesArray) => {
        if (!resourcesArray || resourcesArray.length === 0) {
            return ''; // Return empty string if no resources in this category
        }
        
        let listHtml = `<div class="resource-category content-card"><h3>${title}</h3><ul>`;
        resourcesArray.forEach(resource => {
            listHtml += `<li>
                            <a href="${resource.url}" target="_blank" rel="noopener noreferrer">${resource.name}</a>
                            ${resource.note ? `<span class="resource-note"> - ${resource.note}</span>` : ''}
                         </li>`;
        });
        listHtml += `</ul></div>`;
        return listHtml;
    };

    // Create sections for each category of resources
    resourcesHtml += createResourceListHtml("YouTubers & Coaches", resourcesData.youtubersCoaches);
    resourcesHtml += createResourceListHtml("Communities & Discords", resourcesData.communitiesDiscords);
    resourcesHtml += createResourceListHtml("Tools & Websites", resourcesData.toolsWebsites);
    resourcesHtml += createResourceListHtml("Key Guide Concepts/Links", resourcesData.keyGuideLinks);
    
    resourcesHtml += `</section>`;
    mainContentEl.innerHTML = resourcesHtml;
}