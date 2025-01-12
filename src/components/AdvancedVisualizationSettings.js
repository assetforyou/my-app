import React from 'react';
import { Button, Overlay, Popover, Form } from 'react-bootstrap';
import { Sliders } from 'lucide-react';

const AdvancedVisualizationSettings = ({
  title = "Advanced Settings",
  settings = [],
  target,
  show,
  onHide
}) => {
  return (
    <Overlay
      target={target.current}
      show={show}
      placement="left"
      rootClose={true}
      onHide={onHide}
    >
      <Popover id="advanced-settings-popover">
        <Popover.Header as="h3">{title}</Popover.Header>
        <Popover.Body>
          <Form>
            {settings.map((setting, index) => (
              <Form.Group key={index} className="mb-3">
                <Form.Label>
                  {setting.label}: {setting.value}{setting.unit || ''}
                </Form.Label>
                {setting.type === 'range' && (
                  <Form.Range
                    value={setting.value}
                    onChange={(e) => setting.onChange(Number(e.target.value))}
                    min={setting.min}
                    max={setting.max}
                    step={setting.step}
                  />
                )}
                {setting.type === 'select' && (
                  <Form.Select
                    value={setting.value}
                    onChange={(e) => setting.onChange(e.target.value)}
                  >
                    {setting.options.map((option, idx) => (
                      <option key={idx} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Select>
                )}
              </Form.Group>
            ))}
          </Form>
        </Popover.Body>
      </Popover>
    </Overlay>
  );
};

export const useAdvancedSettings = (initialSettings = {}) => {
  const [showSettings, setShowSettings] = React.useState(false);
  const settingsButtonRef = React.useRef(null);

  const SettingsButton = () => (
    <Button
      ref={settingsButtonRef}
      variant="light"
      size="sm"
      className="p-1"
      onClick={() => setShowSettings(!showSettings)}
    >
      <Sliders size={16} />
    </Button>
  );

  return {
    SettingsButton,
    showSettings,
    setShowSettings,
    settingsButtonRef
  };
};

export default AdvancedVisualizationSettings;