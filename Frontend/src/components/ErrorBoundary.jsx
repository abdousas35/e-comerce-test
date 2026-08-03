import React from 'react';
import { withTranslation } from 'react-i18next';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    const { t } = this.props;
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', textAlign: 'center' }}>
          <h2>{t("common.errorBoundary.title")}</h2>
          <p>{t("common.errorBoundary.message")}</p>
          <button onClick={() => window.location.reload()}>{t("common.errorBoundary.reload")}</button>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default withTranslation()(ErrorBoundary);
