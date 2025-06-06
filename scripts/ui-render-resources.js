// ui-render-resources.js
import { getResourcesData } from './program-data.js';

export function renderResourcesPage(mainContentEl) {
    const resourcesData = getResourcesData(); // Get dynamic resources data
    let resourcesHtml = `<section class="resources-page"><h2>Helpful Resources</h2>`;

    // Helper function to generate HTML for a list of resources in a category
    const createResourceListHtml = (title, resourcesArray) => {
        if (!resourcesArray || resourcesArray.length === 0) {
            return ''; // Return empty string if no resources in this category
        }
        
        let listHtml = `<div class="resource-category content-card"><h3>${title}</h3><ul>`;
        resourcesArray.forEach(resource => {
            listHtml += `<li>
                            <button class="resource-button" onclick="window.open('${resource.url}', '_blank', 'noopener,noreferrer')">
                                <span class="resource-name-text">${resource.name}</span>
                                ${resource.note ? `<span class="resource-note">${resource.note}</span>` : ''}
                            </button>
                         </li>`;
        });
        listHtml += `</ul></div>`;
        return listHtml;
    };

    // Create sections for each category of resources using correct property names
    resourcesHtml += createResourceListHtml("YouTubers & Coaches", resourcesData.youtubersCoaches);
    resourcesHtml += createResourceListHtml("Communities & Discords", resourcesData.communitiesDiscords);
    resourcesHtml += createResourceListHtml("Tools & Websites", resourcesData.toolsWebsites);
    
    resourcesHtml += `</section>`;
    mainContentEl.innerHTML = resourcesHtml;
}