export const convertTextForEditing = (html: string): string => {
  return html.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '');
};

export const formatTextForDisplay = (text: string): string => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const formattedText = text.replace(/\n/g, '<br />');
  return formattedText.replace(
    urlRegex,
    (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`
  );
};
