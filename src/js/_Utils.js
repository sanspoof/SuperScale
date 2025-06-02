export function funcCreateElementFromTemplate(templateId) {

    const template = document.getElementById(templateId);

    if (!template || !(template instanceof HTMLTemplateElement)) {

      throw new Error(`Template with id "${templateId}" not found or not a <template> element.`);

    }
  
    return template.content.firstElementChild.cloneNode(true);

  }

  export function _s(context, role) {
    // If only one argument is passed, assume it's the role and default context to document
    if (role === undefined) {
      role = context;
      context = document;
    }
  
    return context.querySelector(`[data-role="${role}"]`);
  }